
import { supabase } from '@/integrations/supabase/client';

export const getPaginatedFeedbackResponses = async (
  organizationId: string,
  page: number = 1,
  pageSize: number = 20
) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('feedback_responses')
    .select(`
      id,
      created_at,
      response_value,
      question_snapshot
    `, { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching feedback responses:', error);
    throw error;
  }

  return { data, count };
};
