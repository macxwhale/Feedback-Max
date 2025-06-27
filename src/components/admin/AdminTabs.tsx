
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Settings, Code } from 'lucide-react';
import { SystemUserManagement } from './system/SystemUserManagement';
import { OrganizationsList } from './OrganizationsList';
import { FlaskWrapperSettings } from './system/FlaskWrapperSettings';

interface AdminTabsProps {
  organizations: any[];
  onCreateClick: () => void;
  onToggleActive: (orgId: string, currentStatus: boolean) => void;
  onUpdatePlan: (orgId: string, planType: string) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
  organizations,
  onCreateClick,
  onToggleActive,
  onUpdatePlan
}) => {
  return (
    <Tabs defaultValue="organizations" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="organizations" className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Organizations
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Users
        </TabsTrigger>
        <TabsTrigger value="system" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          System Settings
        </TabsTrigger>
        <TabsTrigger value="integrations" className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          API Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="organizations" className="mt-6">
        <OrganizationsList
          organizations={organizations}
          onCreateClick={onCreateClick}
          onToggleActive={onToggleActive}
          onUpdatePlan={onUpdatePlan}
        />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <SystemUserManagement organizations={organizations} />
      </TabsContent>

      <TabsContent value="system" className="mt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">System Settings</h2>
            <p className="text-muted-foreground">
              Configure system-wide settings and integrations.
            </p>
          </div>
          {/* Add more system settings here as needed */}
        </div>
      </TabsContent>

      <TabsContent value="integrations" className="mt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">API Settings</h2>
            <p className="text-muted-foreground">
              Configure external API integrations and wrapper services.
            </p>
          </div>
          <FlaskWrapperSettings />
        </div>
      </TabsContent>
    </Tabs>
  );
};
