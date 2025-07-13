
import React from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/components/auth/AuthWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lock, Loader2, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRoleConfig } from '@/utils/roleManagement';
import { useOrganization } from '@/context/OrganizationContext';
import { useAccessRequest } from '@/hooks/useAccessRequest';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  organizationId?: string;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
  onRequestAccess?: () => void;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  requiredRole,
  requiredPermission,
  organizationId,
  fallback,
  showAccessDenied = true,
  onRequestAccess
}) => {
  const { hasPermission, userRole, isLoading, isAdmin } = useRBAC(organizationId);
  const { isOrgAdmin } = useAuth();
  const { organization } = useOrganization();
  const { submitAccessRequest, isSubmitting } = useAccessRequest();

  console.log('RoleBasedAccess check:', {
    requiredRole,
    requiredPermission,
    userRole,
    isAdmin,
    isOrgAdmin,
    isLoading,
    organizationId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-600">Checking access...</span>
        </div>
      </div>
    );
  }

  // Admin bypass - both system admin and org admin should have access
  if (isAdmin || isOrgAdmin) {
    console.log('Access granted via admin privileges');
    return <>{children}</>;
  }

  // Check role-based access
  if (requiredRole && userRole) {
    const userRoleConfig = getRoleConfig(userRole);
    const requiredRoleConfig = getRoleConfig(requiredRole);
    
    if (userRoleConfig.level < requiredRoleConfig.level) {
      console.log('Access denied - insufficient role level');
      
      if (fallback) return <>{fallback}</>;
      
      if (!showAccessDenied) return null;
      
      const handleRequestAccess = async () => {
        if (onRequestAccess) {
          onRequestAccess();
        } else {
          await submitAccessRequest({
            requestType: 'role_upgrade',
            requestedRole: requiredRole,
            reason: `Need ${requiredRole} level access for this feature`
          });
        }
      };
      
      const RequiredIcon = requiredRoleConfig.icon;
      const UserIcon = userRoleConfig.icon;
      
      return (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Lock className="w-5 h-5 mr-2" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-600">
                You need {requiredRoleConfig.label} level access or higher.
              </span>
            </div>
            
            {/* Organization context */}
            {organization && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Organization:</span> {organization.name}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Required role:</span>
                <Badge variant={requiredRoleConfig.variant} className="flex items-center gap-1">
                  <RequiredIcon className="w-3 h-3" />
                  {requiredRoleConfig.label}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Your role:</span>
                <Badge variant={userRoleConfig.variant} className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  {userRoleConfig.label}
                </Badge>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={handleRequestAccess} 
                size="sm" 
                className="w-full"
                disabled={isSubmitting}
              >
                <Mail className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Requesting...' : 'Request Role Upgrade'}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Contact your organization administrator to request a role upgrade.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('Access denied - insufficient permissions');
    
    if (fallback) return <>{fallback}</>;
    
    if (!showAccessDenied) return null;
    
    const handleRequestAccess = async () => {
      if (onRequestAccess) {
        onRequestAccess();
      } else {
        await submitAccessRequest({
          requestType: 'permission',
          requestedPermission: requiredPermission,
          reason: `Need ${requiredPermission} permission to access this feature`
        });
      }
    };

    const UserIcon = userRole ? getRoleConfig(userRole).icon : null;
    
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Lock className="w-5 h-5 mr-2" />
            Permission Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-600">
              You don't have the required permission: {requiredPermission}
            </span>
          </div>
          
          {/* Organization context */}
          {organization && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Organization:</span> {organization.name}
              </p>
            </div>
          )}
          
          {/* Current role display */}
          {userRole && UserIcon && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Your role:</span>
              <Badge variant={getRoleConfig(userRole).variant} className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                {getRoleConfig(userRole).label}
              </Badge>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleRequestAccess} 
              size="sm" 
              className="w-full"
              disabled={isSubmitting}
            >
              <Mail className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Requesting...' : 'Request Access'}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Contact your organization administrator for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('Access granted');
  return <>{children}</>;
};
