
import React from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/components/auth/AuthWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lock, UserX, Loader2, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRoleConfig } from '@/utils/roleManagement';
import { useOrganization } from '@/context/OrganizationContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  organizationId?: string;
  fallback?: React.ReactNode;
  showRequiredRole?: boolean;
  onRequestAccess?: () => void;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  organizationId,
  fallback,
  showRequiredRole = true,
  onRequestAccess
}) => {
  const { hasPermission, userRole, isLoading, isAdmin, error } = useRBAC(organizationId);
  const { isOrgAdmin } = useAuth();
  const { organization } = useOrganization();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-gray-600">Checking permissions...</span>
        </div>
      </div>
    );
  }

  // Handle errors in role fetching
  if (error) {
    console.error('Permission guard error:', error);
    return (
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center text-amber-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Permission Check Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Unable to verify permissions. Please refresh the page or contact support if the issue persists.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Admin bypass - both system admin and org admin should have access
  if (isAdmin || isOrgAdmin) {
    console.log('Permission granted via admin privileges');
    return <>{children}</>;
  }

  // Check permission
  if (hasPermission(permission)) {
    console.log('Permission granted:', permission);
    return <>{children}</>;
  }

  console.log('Permission denied:', { permission, userRole, organizationId });

  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied UI
  const requiredRole = getRequiredRoleForPermission(permission);
  const requiredConfig = getRoleConfig(requiredRole);
  const currentConfig = userRole ? getRoleConfig(userRole) : null;

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
            You don't have permission to access this feature.
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
        
        {/* Permission details */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Required permission:</span> {permission}
          </p>
        </div>
        
        {showRequiredRole && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Required role:</span>
              <Badge variant={requiredConfig.variant} className="flex items-center gap-1">
                <requiredConfig.icon className="w-3 h-3" />
                {requiredConfig.label}
              </Badge>
            </div>
            
            {currentConfig && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Your role:</span>
                <Badge variant={currentConfig.variant} className="flex items-center gap-1">
                  <currentConfig.icon className="w-3 h-3" />
                  {currentConfig.label}
                </Badge>
              </div>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-col space-y-2">
          {onRequestAccess && (
            <Button onClick={onRequestAccess} size="sm" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Request Access
            </Button>
          )}
          
          <p className="text-xs text-gray-500 text-center">
            Contact your organization administrator to request the required permissions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

function getRequiredRoleForPermission(permission: string): string {
  const permissionRoleMap: Record<string, string> = {
    'view_analytics': 'viewer',
    'export_data': 'analyst',
    'manage_questions': 'manager',
    'manage_users': 'admin',
    'manage_integrations': 'admin',
    'manage_organization': 'admin',
    'manage_billing': 'owner'
  };
  return permissionRoleMap[permission] || 'admin';
}
