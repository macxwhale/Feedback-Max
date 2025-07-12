
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const checkUserPermissions = async (
  supabaseClient: SupabaseClient,
  userId: string,
  organizationId: string
): Promise<{ hasPermission: boolean; error?: string; userRole?: string }> => {
  const { data: orgUser, error: permissionError } = await supabaseClient
    .from('organization_users')
    .select('enhanced_role')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .single();

  if (permissionError || !orgUser) {
    console.error('Permission check failed:', permissionError);
    return {
      hasPermission: false,
      error: 'You are not a member of this organization or do not have permission to invite users'
    };
  }

  const allowedRoles = ['manager', 'admin', 'owner'];
  if (!allowedRoles.includes(orgUser.enhanced_role)) {
    console.error('Insufficient permissions. User role:', orgUser.enhanced_role);
    return {
      hasPermission: false,
      error: 'You need manager-level access or higher to invite users'
    };
  }

  return { hasPermission: true, userRole: orgUser.enhanced_role };
};
