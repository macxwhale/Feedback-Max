
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings,
  Plus,
} from 'lucide-react';

interface QuickActionsProps {
  onCreateQuestion: () => void;
  onViewSettings: () => void;
  onInviteUser: () => void;
  onExportData: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateQuestion,
  onViewSettings,
}) => {
  const actions = [
    {
      title: 'Create Question',
      description: 'Add new feedback question',
      icon: Plus,
      onClick: onCreateQuestion,
      variant: 'default' as const
    },
    {
      title: 'Settings',
      description: 'Configure organization',
      icon: Settings,
      onClick: onViewSettings,
      variant: 'outline' as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.onClick}
              className="h-auto p-4 flex flex-col items-start space-y-2"
            >
              <div className="flex items-center space-x-2 w-full">
                <action.icon className="w-5 h-5" />
                <span className="font-medium">{action.title}</span>
              </div>
              <span className="text-sm text-left opacity-70">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
