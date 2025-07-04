
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOrganizations } from '@/services/organizationQueries';
import { updateOrganization, createOrganization } from '@/services/organizationMutations';
import type { CreateOrganizationData } from '@/services/organizationService.types';
import { AdminStats } from './AdminStats';
import { FormConfig } from './FormConfig';
import { WebhookSettings } from './WebhookSettings';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { OrganizationsList } from './OrganizationsList';
import { AdminTabs } from './AdminTabs';
import { toast } from 'sonner';
import { SystemUserManagement } from './system/SystemUserManagement';

export const AdminDashboard: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: getAllOrganizations,
  });

  const updateOrgMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      updateOrganization(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization updated successfully');
    },
    onError: () => {
      toast.error('Failed to update organization');
    }
  });

  const createOrgMutation = useMutation({
    mutationFn: (orgData: CreateOrganizationData) => createOrganization(orgData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setShowCreateModal(false);
      toast.success('Organization created successfully');
    },
    onError: () => {
      toast.error('Failed to create organization');
    }
  });

  const handleToggleActive = (orgId: string, currentStatus: boolean) => {
    updateOrgMutation.mutate({
      id: orgId,
      updates: { is_active: !currentStatus }
    });
  };

  const handleUpdatePlan = (orgId: string, planType: string) => {
    updateOrgMutation.mutate({
      id: orgId,
      updates: { plan_type: planType }
    });
  };

  if (isLoading) {
    return <div className="p-8">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Admin Dashboard</h1>
          <p className="text-gray-600">Manage organizations, view statistics, and configure system settings</p>
        </div>

        <AdminTabs 
          organizations={organizations}
          onCreateClick={() => setShowCreateModal(true)}
          onToggleActive={handleToggleActive}
          onUpdatePlan={handleUpdatePlan}
        />

        {showCreateModal && (
          <CreateOrganizationModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={(data) => createOrgMutation.mutate(data)}
          />
        )}
      </div>
    </div>
  );
};
