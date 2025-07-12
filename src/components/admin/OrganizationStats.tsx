import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Organization } from '@/services/organizationService.types';

interface OrganizationStatsProps {
  organizations: Organization[];
}

export const OrganizationStats: React.FC<OrganizationStatsProps> = ({ organizations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{organizations?.length || 0}</div>
          <p className="text-sm text-gray-600">Total Organizations</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {organizations?.filter(org => org.is_active).length || 0}
          </div>
          <p className="text-sm text-gray-600">Active</p>
        </CardContent>
      </Card>
    </div>
  );
};
