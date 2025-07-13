
import React from 'react';
import { AccessDeniedPage } from './AccessDeniedPage';

interface SystemAdminRequiredProps {
  customMessage?: string;
  showBackButton?: boolean;
}

export const SystemAdminRequired: React.FC<SystemAdminRequiredProps> = ({
  customMessage,
  showBackButton = true
}) => {
  return (
    <AccessDeniedPage
      type="system-admin"
      customMessage={customMessage}
      showBackButton={showBackButton}
    />
  );
};
