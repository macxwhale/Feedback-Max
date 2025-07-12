
import React from 'react';

interface SimpleUserManagementHeaderProps {
  organizationName: string;
}

export const SimpleUserManagementHeader: React.FC<SimpleUserManagementHeaderProps> = ({
  organizationName,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-gray-600">Manage members and invitations for {organizationName}</p>
      </div>
    </div>
  );
};
