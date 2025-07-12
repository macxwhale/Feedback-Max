import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface RBACContext {
  userId: string;
  userEmail?: string;
  organizationId: string;
  userRole: string;
  isSystemAdmin: boolean;
}

export interface RBACConfig {
  requiredPermission?: string;
  requireOrgMembership?: boolean;
  allowSystemAdmin?: boolean;
  getOrgId?: (req: Request) => string | null;
  passBodyToHandler?: boolean; // New option
}

// Permission mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'owner': ['*'],
  'admin': ['manage_organization', 'manage_users', 'manage_questions', 'view_analytics', 'export_data', 'manage_integrations'],
  'manager': ['manage_users', 'manage_questions', 'view_analytics', 'export_data'],
  'analyst': ['view_analytics', 'export_data', 'manage_questions'],
  'member': ['view_analytics'],
  'viewer': ['view_analytics']
};

function hasPermission(userRole: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

function getRequiredRoleForPermission(permission: string): string {
  for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    if (permissions.includes('*') || permissions.includes(permission)) {
      return role;
    }
  }
  return 'admin';
}

export function withRBAC(config: RBACConfig) {
  return (handler: (req: Request, context: RBACContext, body?: any) => Promise<Response>) => {
    return async (req: Request): Promise<Response> => {
      try {
        const corsHeaders = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        };

        if (req.method === 'OPTIONS') {
          return new Response('ok', { headers: corsHeaders });
        }

        // Parse body once if needed
        let body = null;
        if (config.passBodyToHandler && req.method !== 'GET') {
          try {
            body = await req.json();
          } catch (error) {
            console.error('Failed to parse request body:', error);
            return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        // Get organization ID from body, query params, or URL
        let organizationId = config.getOrgId?.(req);
        if (!organizationId && body?.organizationId) {
          organizationId = body.organizationId;
        }
        if (!organizationId) {
          const url = new URL(req.url);
          organizationId = url.searchParams.get('organizationId') || url.searchParams.get('org_id');
        }

        // Create Supabase client
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_ANON_KEY')!,
          { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // Get current user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
          return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check if user is system admin
        const { data: adminData } = await supabaseClient
          .from('admin_users')
          .select('is_super_admin')
          .eq('user_id', user.id)
          .single();

        const isSystemAdmin = adminData?.is_super_admin || false;

        // Allow system admins to bypass all checks if configured
        if (config.allowSystemAdmin && isSystemAdmin) {
          const context: RBACContext = {
            userId: user.id,
            userEmail: user.email,
            organizationId: organizationId || '',
            userRole: 'owner', // System admins get owner-level permissions
            isSystemAdmin: true
          };
          
          return await handler(req, context, body);
        }

        // Check organization membership if required
        if (config.requireOrgMembership && organizationId) {
          const { data: orgUser } = await supabaseClient
            .from('organization_users')
            .select('enhanced_role, role')
            .eq('user_id', user.id)
            .eq('organization_id', organizationId)
            .eq('status', 'active')
            .single();

          if (!orgUser) {
            return new Response(JSON.stringify({ error: 'Organization membership required' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Check permission if specified
          if (config.requiredPermission) {
            const userRole = orgUser.enhanced_role || orgUser.role;
            if (!hasPermission(userRole, config.requiredPermission)) {
              return new Response(JSON.stringify({ 
                error: `Permission '${config.requiredPermission}' required`,
                required_role: getRequiredRoleForPermission(config.requiredPermission)
              }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          }

          const context: RBACContext = {
            userId: user.id,
            userEmail: user.email,
            organizationId: organizationId,
            userRole: orgUser.enhanced_role || orgUser.role,
            isSystemAdmin: false
          };

          return await handler(req, context, body);
        }

        // Default context for non-org-specific operations
        const context: RBACContext = {
          userId: user.id,
          userEmail: user.email,
          organizationId: organizationId || '',
          userRole: isSystemAdmin ? 'owner' : 'member',
          isSystemAdmin
        };

        return await handler(req, context, body);

      } catch (error) {
        console.error('RBAC middleware error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
  };
}
