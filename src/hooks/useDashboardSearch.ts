
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  title: string;
  type: 'member' | 'question' | 'session' | 'setting';
  description: string;
  url?: string;
}

export const useDashboardSearch = (organizationId: string, query: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setLoading(true);
      try {
        const searchResults: SearchResult[] = [];

        // Search organization members
        const { data: members } = await supabase
          .from('organization_users')
          .select('id, email, role, status')
          .eq('organization_id', organizationId)
          .eq('status', 'active')
          .ilike('email', `%${query}%`)
          .limit(3);

        if (members) {
          members.forEach(member => {
            searchResults.push({
              id: member.id,
              title: member.email,
              type: 'member',
              description: `${member.role} member`,
              url: '/admin/members'
            });
          });
        }

        // Search questions
        const { data: questions } = await supabase
          .from('questions')
          .select('id, question_text, question_type')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .ilike('question_text', `%${query}%`)
          .limit(3);

        if (questions) {
          questions.forEach(question => {
            searchResults.push({
              id: question.id,
              title: question.question_text.substring(0, 50) + (question.question_text.length > 50 ? '...' : ''),
              type: 'question',
              description: `${question.question_type} question`,
              url: '/admin/questions'
            });
          });
        }

        // Search recent sessions
        const { data: sessions } = await supabase
          .from('feedback_sessions')
          .select('id, status, created_at, total_score')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(3);

        if (sessions) {
          sessions.forEach(session => {
            const createdDate = new Date(session.created_at).toLocaleDateString();
            searchResults.push({
              id: session.id,
              title: `Session ${session.id.substring(0, 8)}`,
              type: 'session',
              description: `${session.status} • ${createdDate} • Score: ${session.total_score || 'N/A'}`,
              url: '/admin/feedback'
            });
          });
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [organizationId, query]);

  return { results, loading };
};
