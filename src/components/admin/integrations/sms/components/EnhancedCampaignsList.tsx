
import React, { useState, useMemo } from 'react';
import { Send, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedCampaignItem } from './EnhancedCampaignItem';
import { CampaignFilters } from './CampaignFilters';

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
  onDuplicate: (campaignId: string) => void;
  onSchedule: (campaignId: string) => void;
  onDelete: (campaignId: string) => void;
  onCreateNew: () => void;
  isLoading: boolean;
}

export const EnhancedCampaignsList: React.FC<EnhancedCampaignsListProps> = ({
  campaigns,
  onSend,
  onResend,
  onRetry,
  onDuplicate,
  onSchedule,
  onDelete,
  onCreateNew,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = searchTerm === '' || 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.message_template.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Campaign];
      let bValue: any = b[sortBy as keyof Campaign];

      if (sortBy === 'created_at' || sortBy === 'started_at' || sortBy === 'completed_at') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [campaigns, searchTerm, statusFilter, sortBy, sortOrder]);

  const exportCampaigns = () => {
    const csvContent = [
      ['Name', 'Status', 'Recipients', 'Sent', 'Delivered', 'Failed', 'Created'],
      ...filteredAndSortedCampaigns.map(campaign => [
        campaign.name,
        campaign.status,
        campaign.total_recipients.toString(),
        campaign.sent_count.toString(),
        campaign.delivered_count.toString(),
        campaign.failed_count.toString(),
        new Date(campaign.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sms-campaigns-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center p-12">
        <Send className="w-16 h-16 mx-auto mb-6 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No SMS Campaigns Yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Create your first SMS campaign to start engaging with your customers through text messaging.
        </p>
        <Button onClick={onCreateNew} size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-5 h-5 mr-2" />
          Create First Campaign
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">SMS Campaigns ({campaigns.length})</h4>
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedCampaigns.length} of {campaigns.length} campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCampaigns}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={onCreateNew} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
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

      {/* Campaigns Grid */}
      {filteredAndSortedCampaigns.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No campaigns match your current filters.</p>
          <Button variant="ghost" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }} className="mt-2">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedCampaigns.map((campaign) => (
            <EnhancedCampaignItem
              key={campaign.id}
              campaign={campaign}
              onSend={onSend}
              onResend={onResend}
              onRetry={onRetry}
              onDuplicate={onDuplicate}
              onSchedule={onSchedule}
              onDelete={onDelete}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};
