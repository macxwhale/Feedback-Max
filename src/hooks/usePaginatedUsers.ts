
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PaginatedUsersParams {
  organizationId: string;
  pageSize?: number;
  pageOffset?: number;
  searchTerm?: string;
  roleFilter?: string;
  enabled?: boolean;
}

interface PaginatedUsersResult {
  users: any[];
  total_count: number;
  page_size: number;
  page_offset: number;
  has_more: boolean;
}

const sanitizeInput = (value: string) => value.trim();

export const usePaginatedUsers = ({
  organizationId,
  pageSize = 20,
  pageOffset = 0,
  searchTerm,
  roleFilter,
  enabled = true,
}: PaginatedUsersParams) => {
  return useQuery({
    queryKey: ['paginated-users', organizationId, pageSize, pageOffset, searchTerm, roleFilter],
    queryFn: async (): Promise<PaginatedUsersResult> => {
      const { data, error } = await supabase.rpc('get_paginated_organization_users', {
        org_id: organizationId,
        page_size: pageSize,
        page_offset: pageOffset,
        search_term: searchTerm ? sanitizeInput(searchTerm) : null,
        role_filter: roleFilter === 'all' ? null : (roleFilter || null)
      });

      if (error) throw error;
      
      // Properly cast the Json response to our interface
      return data as unknown as PaginatedUsersResult;
    },
    enabled: !!organizationId && enabled,
    staleTime: 30000,
  });
};
