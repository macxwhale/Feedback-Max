
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { EnhancedCampaignItem } from './EnhancedCampaignItem';
import { CampaignFilters } from './CampaignFilters';
import { CampaignEditModal } from './CampaignEditModal';
import { CampaignDeleteModal } from './CampaignDeleteModal';

interface Campaign {
  id: string;
  name: string;
  message_template: string;
  status: string;
  created_at: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  started_at?: string;
  completed_at?: string;
}

interface EnhancedCampaignsListProps {
  campaigns: Campaign[];
  onSend: (campaignId: string) => void;
  onResend: (campaignId: string) => void;
  onRetry: (campaignId: string) => void;
  onCancel: (campaignId: string) => void;
  onPause: (campaignId: string) => void;
  onResume: (campaignId: string) => void;
  onDuplicate: (campaignId: string) => void;
  onSchedule: (campaignId: string) => void;
  onEdit: (campaignId: string, name: string, template: string) => void;
  onDelete: (campaignId: string) => void;
  onCreateNew: () => void;
  isLoading: boolean;
  isEditLoading?: boolean;
  isDeleteLoading?: boolean;
}

export const EnhancedCampaignsList: React.FC<EnhancedCampaignsListProps> = ({
  campaigns,
  onSend,
  onResend,
  onRetry,
  onCancel,
  onPause,
  onResume,
  onDuplicate,
  onSchedule,
  onEdit,
  onDelete,
  onCreateNew,
  isLoading,
  isEditLoading = false,
  isDeleteLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  // Filter and sort campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.message_template.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Campaign];
      let bValue: any = b[sortBy as keyof Campaign];

      // Handle date fields
      if (sortBy === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle numeric fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      return 0;
    });

    return filtered;
  }, [campaigns, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
  };

  const handleSaveEdit = (campaignId: string, name: string, template: string) => {
    onEdit(campaignId, name, template);
    setEditingCampaign(null);
  };

  const handleDelete = (campaign: Campaign) => {
    setDeletingCampaign(campaign);
  };

  const handleConfirmDelete = (campaignId: string) => {
    onDelete(campaignId);
    setDeletingCampaign(null);
  };

  if (campaigns.length === 0) {
    return (
      <div className="w-full text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Create your first SMS campaign to start reaching your audience with targeted messages.
        </p>
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Campaign
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Campaign Management</h3>
          <p className="text-sm text-gray-600">
            {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} total
            {filteredAndSortedCampaigns.length !== campaigns.length && 
              ` • ${filteredAndSortedCampaigns.length} shown`
            }
          </p>
        </div>
        <Button onClick={onCreateNew} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Filters */}
      <CampaignFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        totalCampaigns={campaigns.length}
        filteredCount={filteredAndSortedCampaigns.length}
      />

      {/* Campaigns List */}
      <div className="w-full space-y-4">
        {filteredAndSortedCampaigns.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No campaigns match your current filters.</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          filteredAndSortedCampaigns.map((campaign) => (
            <EnhancedCampaignItem
              key={campaign.id}
              campaign={campaign}
              onSend={onSend}
              onResend={onResend}
              onRetry={onRetry}
              onCancel={onCancel}
              onPause={onPause}
              onResume={onResume}
              onDuplicate={onDuplicate}
              onSchedule={onSchedule}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          ))
        )}
      </div>

      {/* Edit Modal */}
      <CampaignEditModal
        campaign={editingCampaign}
        isOpen={!!editingCampaign}
        onClose={() => setEditingCampaign(null)}
        onSave={handleSaveEdit}
        isLoading={isEditLoading}
      />

      {/* Delete Modal */}
      <CampaignDeleteModal
        campaign={deletingCampaign}
        isOpen={!!deletingCampaign}
        onClose={() => setDeletingCampaign(null)}
        onDelete={handleConfirmDelete}
        isLoading={isDeleteLoading}
      />
    </div>
  );
};
