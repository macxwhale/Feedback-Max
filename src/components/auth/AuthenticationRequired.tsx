
import React from 'react';
import { AccessDeniedPage } from './AccessDeniedPage';

interface AuthenticationRequiredProps {
  customMessage?: string;
  showBackButton?: boolean;
}

export const AuthenticationRequired: React.FC<AuthenticationRequiredProps> = ({
  customMessage,
  showBackButton = false
}) => {
  return (
    <AccessDeniedPage
      type="authentication"
      customMessage={customMessage}
      showBackButton={showBackButton}
    />
  );
};
