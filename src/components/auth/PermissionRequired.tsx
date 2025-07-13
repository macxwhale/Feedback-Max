
import React from 'react';
import { AccessDeniedPage } from './AccessDeniedPage';
import { useOrganization } from '@/context/OrganizationContext';

interface PermissionRequiredProps {
  permission: string;
  requiredRole?: string;
  currentUserRole?: string;
  customMessage?: string;
  showBackButton?: boolean;
  onRequestAccess?: () => void;
}

export const PermissionRequired: React.FC<PermissionRequiredProps> = ({
  permission,
  requiredRole,
  currentUserRole,
  customMessage,
  showBackButton = true,
  onRequestAccess
}) => {
  const { organization } = useOrganization();

  return (
    <AccessDeniedPage
      type="permission"
      requiredPermission={permission}
      requiredRole={requiredRole}
      currentUserRole={currentUserRole}
      organizationName={organization?.name}
      organizationSlug={organization?.slug}
      customMessage={customMessage}
      showBackButton={showBackButton}
      onRequestAccess={onRequestAccess}
    />
  );
};
