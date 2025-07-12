
import React from 'react';

interface UserManagementHeaderProps {
  organizationName: string;
  onInviteUser: () => void;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  organizationName,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Enhanced User Management</h2>
        <p className="text-gray-600">Manage members for {organizationName}</p>
      </div>
    </div>
  );
};
