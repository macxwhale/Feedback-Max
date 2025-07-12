
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Organization } from '@/services/organizationService.types';
import { OrganizationStats } from './OrganizationStats';
import { OrganizationCard } from './OrganizationCard';

interface OrganizationsListProps {
  organizations: Organization[];
  onCreateClick: () => void;
  onToggleActive: (orgId: string, currentStatus: boolean) => void;
  onUpdatePlan: (orgId: string, planType: string) => void;
}

export const OrganizationsList: React.FC<OrganizationsListProps> = ({
  organizations,
  onCreateClick,
  onToggleActive,
  onUpdatePlan
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Organizations</h2>
          <p className="text-gray-600">Manage all organizations in the system</p>
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Add Organization
        </Button>
      </div>

      <OrganizationStats organizations={organizations} />
      
      <div className="grid gap-4">
        {organizations?.map((org) => (
          <OrganizationCard
            key={org.id}
            org={org}
            onToggleActive={onToggleActive}
            onUpdatePlan={onUpdatePlan}
          />
        ))}
      </div>
    </div>
  );
};
