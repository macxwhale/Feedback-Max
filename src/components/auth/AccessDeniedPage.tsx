
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, Shield, User, Mail, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { getRoleConfig } from '@/utils/roleManagement';

export type AccessDenialType = 'system-admin' | 'org-admin' | 'permission' | 'authentication';

interface AccessDeniedPageProps {
  type: AccessDenialType;
  requiredRole?: string;
  requiredPermission?: string;
  organizationName?: string;
  organizationSlug?: string;
  currentUserRole?: string;
  customMessage?: string;
  showBackButton?: boolean;
  onRequestAccess?: () => void;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  type,
  requiredRole,
  requiredPermission,
  organizationName,
  organizationSlug,
  currentUserRole,
  customMessage,
  showBackButton = true,
  onRequestAccess
}) => {
  const navigate = useNavigate();

  const getAccessDenialContent = () => {
    switch (type) {
      case 'system-admin':
        return {
          icon: Shield,
          title: 'System Administrator Access Required',
          description: 'This area is restricted to system administrators only. You need elevated privileges to access these features.',
          actionText: 'Contact your system administrator to request access.',
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600'
        };
      
      case 'org-admin':
        return {
          icon: User,
          title: `Organization Administrator Access Required`,
          description: organizationName 
            ? `You need administrator privileges for "${organizationName}" to access this dashboard.`
            : 'You need organization administrator privileges to access this area.',
          actionText: 'Contact your organization administrator to request elevated permissions.',
          bgColor: 'bg-amber-50',
          iconColor: 'text-amber-600'
        };
      
      case 'permission':
        return {
          icon: Lock,
          title: 'Permission Required',
          description: requiredPermission 
            ? `You don't have the required permission: "${requiredPermission}"`
            : 'You don\'t have the necessary permissions to access this feature.',
          actionText: 'Contact your administrator to request the required permissions.',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600'
        };
      
      case 'authentication':
        return {
          icon: AlertTriangle,
          title: 'Authentication Required',
          description: 'You must be logged in to access this page.',
          actionText: 'Please sign in to continue.',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-600'
        };
      
      default:
        return {
          icon: Lock,
          title: 'Access Denied',
          description: 'You don\'t have permission to access this page.',
          actionText: 'Contact your administrator for assistance.',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-600'
        };
    }
  };

  const content = getAccessDenialContent();
  const IconComponent = content.icon;
  
  const requiredConfig = requiredRole ? getRoleConfig(requiredRole) : null;
  const currentConfig = currentUserRole ? getRoleConfig(currentUserRole) : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className={`border-l-4 ${content.bgColor}`}>
          <CardHeader className="text-center pb-4">
            <div className={`mx-auto w-16 h-16 ${content.bgColor} rounded-full flex items-center justify-center mb-4`}>
              <IconComponent className={`w-8 h-8 ${content.iconColor}`} />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {content.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {customMessage || content.description}
              </p>
              
              {/* Role comparison for role-based denials */}
              {(type === 'org-admin' || type === 'permission') && requiredConfig && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Required role:</span>
                    <Badge variant={requiredConfig.variant} className="flex items-center gap-1">
                      <requiredConfig.icon className="w-3 h-3" />
                      {requiredConfig.label}
                    </Badge>
                  </div>
                  
                  {currentConfig && (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Your role:</span>
                      <Badge variant={currentConfig.variant} className="flex items-center gap-1">
                        <currentConfig.icon className="w-3 h-3" />
                        {currentConfig.label}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              
              {/* Organization context */}
              {organizationName && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Organization:</span> {organizationName}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                {content.actionText}
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col space-y-3">
              {type === 'authentication' ? (
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full"
                >
                  Sign In
                </Button>
              ) : (
                <>
                  {onRequestAccess && (
                    <Button 
                      onClick={onRequestAccess}
                      className="w-full"
                      variant="default"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Request Access
                    </Button>
                  )}
                  
                  {organizationSlug && type === 'org-admin' && (
                    <Button 
                      onClick={() => navigate(`/${organizationSlug}`)}
                      variant="outline"
                      className="w-full"
                    >
                      View Public Page
                    </Button>
                  )}
                </>
              )}
              
              {showBackButton && (
                <Button 
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
