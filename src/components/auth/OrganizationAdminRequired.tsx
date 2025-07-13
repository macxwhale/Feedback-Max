
import React from 'react';
import { AccessDeniedPage } from './AccessDeniedPage';
import { useOrganization } from '@/context/OrganizationContext';
import { useAuth } from './AuthWrapper';

interface OrganizationAdminRequiredProps {
  customMessage?: string;
  showBackButton?: boolean;
  onRequestAccess?: () => void;
}

export const OrganizationAdminRequired: React.FC<OrganizationAdminRequiredProps> = ({
  customMessage,
  showBackButton = true,
  onRequestAccess
}) => {
  const { organization } = useOrganization();
  const { user } = useAuth();

  return (
    <AccessDeniedPage
      type="org-admin"
      organizationName={organization?.name}
      organizationSlug={organization?.slug}
      customMessage={customMessage}
      showBackButton={showBackButton}
      onRequestAccess={onRequestAccess}
    />
  );
};
