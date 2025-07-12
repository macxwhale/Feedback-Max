
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Mail } from 'lucide-react';

interface UserManagementTabsProps {
  activeTab: 'members' | 'invitations';
  setActiveTab: (tab: 'members' | 'invitations') => void;
  membersCount: number;
  invitationsCount: number;
}

export const UserManagementTabs: React.FC<UserManagementTabsProps> = ({
  activeTab,
  setActiveTab,
  membersCount,
  invitationsCount,
}) => {
  const tabs = [
    { id: 'members', label: 'Members', icon: Users, count: membersCount },
    { id: 'invitations', label: 'Pending Invitations', icon: Mail, count: invitationsCount },
  ];

  return (
    <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
      {tabs.map(({ id, label, icon: Icon, count }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id as 'members' | 'invitations')}
          className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === id
              ? 'bg-sunset-100 text-sunset-700'
              : 'text-gray-500 hover:text-sunset-600'
          }`}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
          {count > 0 && (
            <Badge variant="secondary" className="ml-2">
              {count}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
};
