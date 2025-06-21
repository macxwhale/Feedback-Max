
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface RBACContext {
  userId: string;
  organizationId?: string;
  userRole?: string;
  isAdmin?: boolean;
}

export interface RBACOptions {
  requiredPermission?: string;
  requiredRole?: string;
  allowSystemAdmin?: boolean;
  requireOrgMembership?: boolean;
}

export class EdgeRBACService {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async validateRequest(
    req: Request,
    options: RBACOptions = {}
  ): Promise<{ context: RBACContext; error?: string }> {
    const {
      requiredPermission,
      requiredRole,
      allowSystemAdmin = true,
      requireOrgMembership = false
    } = options;

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return { context: {} as RBACContext, error: 'Authorization header required' };
    }

    const { data: { user }, error: authError } = await this.supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return { context: {} as RBACContext, error: 'Invalid authentication' };
    }

    const context: RBACContext = { userId: user.id };

    // Check if user is system admin
    if (allowSystemAdmin) {
      const { data: isAdmin, error: adminError } = await this.supabase
        .rpc('get_current_user_admin_status');
      
      if (!adminError && isAdmin) {
        context.isAdmin = true;
        return { context }; // System admin bypasses all other checks
      }
    }

    // Get organization ID from request body or query params
    const url = new URL(req.url);
    let organizationId = url.searchParams.get('organizationId');
    
    if (!organizationId && req.method !== 'GET') {
      try {
        const body = await req.json();
        organizationId = body.organizationId;
      } catch (e) {
        // Body might not be JSON or already consumed
      }
    }

    if (requireOrgMembership && !organizationId) {
      return { context, error: 'Organization ID required' };
    }

    if (organizationId) {
      context.organizationId = organizationId;

      // Get user's role in the organization
      const { data: orgUser, error: orgError } = await this.supabase
        .from('organization_users')
        .select('enhanced_role')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .single();

      if (orgError && requireOrgMembership) {
        return { context, error: 'User not member of organization' };
      }

      if (orgUser) {
        context.userRole = orgUser.enhanced_role;
      }
    }

    // Check required role
    if (requiredRole && context.userRole) {
      const hasRequiredRole = this.checkRoleHierarchy(context.userRole, requiredRole);
      if (!hasRequiredRole) {
        return { 
          context, 
          error: `Required role '${requiredRole}' or higher, but user has '${context.userRole}'` 
        };
      }
    }

    // Check required permission
    if (requiredPermission && context.userRole) {
      const hasPermission = this.checkPermission(context.userRole, requiredPermission);
      if (!hasPermission) {
        return { 
          context, 
          error: `Permission '${requiredPermission}' required` 
        };
      }
    }

    return { context };
  }

  private checkRoleHierarchy(userRole: string, requiredRole: string): boolean {
    const roleHierarchy: Record<string, number> = {
      'viewer': 1,
      'member': 2,
      'analyst': 3,
      'manager': 4,
      'admin': 5,
      'owner': 6
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  private checkPermission(userRole: string, permission: string): boolean {
    const rolePermissions: Record<string, string[]> = {
      'viewer': ['view_analytics'],
      'member': ['view_analytics'],
      'analyst': ['view_analytics', 'export_data', 'manage_questions'],
      'manager': ['view_analytics', 'export_data', 'manage_questions', 'manage_users'],
      'admin': ['view_analytics', 'export_data', 'manage_questions', 'manage_users', 'manage_integrations', 'manage_organization'],
      'owner': ['view_analytics', 'export_data', 'manage_questions', 'manage_users', 'manage_integrations', 'manage_organization', 'manage_billing']
    };

    const userPermissions = rolePermissions[userRole] || [];
    return userPermissions.includes(permission);
  }

  createResponse(error: string, status: number = 403): Response {
    return new Response(
      JSON.stringify({ 
        error, 
        timestamp: new Date().toISOString(),
        code: 'RBAC_ERROR'
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      }
    );
  }
}

// Decorator function for edge functions
export function withRBAC(options: RBACOptions) {
  return function(handler: (req: Request, context: RBACContext) => Promise<Response>) {
    return async (req: Request): Promise<Response> => {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          }
        });
      }

      const rbacService = new EdgeRBACService(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { context, error } = await rbacService.validateRequest(req, options);

      if (error) {
        console.error('RBAC validation failed:', error);
        return rbacService.createResponse(error);
      }

      try {
        return await handler(req, context);
      } catch (err) {
        console.error('Handler error:', err);
        return rbacService.createResponse('Internal server error', 500);
      }
    };
  };
}
