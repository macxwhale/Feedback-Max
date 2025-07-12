
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BaseMutationConfig<TParams, TResponse> {
  rpcName: string;
  queryKeysToInvalidate: string[][];
  successMessage: string;
  errorMessage: string;
  onSuccessCustom?: (data: TResponse) => void;
  paramsMapper: (params: TParams) => Record<string, any>;
}

export const createMutation = <TParams, TResponse>({
  rpcName,
  queryKeysToInvalidate,
  successMessage,
  errorMessage,
  onSuccessCustom,
  paramsMapper,
}: BaseMutationConfig<TParams, TResponse>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: TParams) => {
      const { data, error } = await supabase.rpc(rpcName as any, paramsMapper(params));

      if (error) throw error;
      
      const response = data as unknown as TResponse;
      if (response && typeof response === 'object' && 'success' in response) {
        const successResponse = response as { success: boolean; error?: string };
        if (!successResponse.success) {
          throw new Error(successResponse.error);
        }
      }
      
      return response;
    },
    onSuccess: (data) => {
      queryKeysToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      if (onSuccessCustom) {
        onSuccessCustom(data);
      } else {
        toast.success(successMessage);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || errorMessage);
    }
  });
};
