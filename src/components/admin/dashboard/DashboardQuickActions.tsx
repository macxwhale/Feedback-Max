
import React from 'react';
import { Users, MessageSquare } from 'lucide-react';
import { H2 } from '@/components/ui/typography';

interface DashboardQuickActionsProps {
  onTabChange: (tab: string) => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ onTabChange }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <H2 className="mb-4">Quick Actions</H2>
      <div className="space-y-3">
        <button
          onClick={() => onTabChange('members')}
          className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Invite new members</span>
          </div>
        </button>
        <button
          onClick={() => onTabChange('questions')}
          className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <span>Create new question</span>
          </div>
        </button>
      </div>
    </div>
  );
};
