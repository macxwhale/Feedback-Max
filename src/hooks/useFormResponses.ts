
import { useState } from 'react';
import { FeedbackResponse } from '@/components/FeedbackForm';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/context/OrganizationContext';
import { useToast } from '@/components/ui/use-toast';
import { ResponseTimeData } from '@/services/responseTimeService';

export const useFormResponses = () => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { organization } = useOrganization();
  const { toast } = useToast();

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const loadResponses = (savedResponses: Record<string, any>) => {
    setResponses(savedResponses);
  };

  const generateFinalResponses = (): FeedbackResponse[] => {
    return Object.entries(responses).map(([questionId, value]) => ({
      questionId,
      value,
      score: Math.floor(Math.random() * 5) + 1,
      category: 'QualityService'
    }));
  };

  const submitResponses = async (questions: any[], timingData?: ResponseTimeData) => {
    if (!organization?.id) {
      throw new Error('Organization not found');
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting feedback via Edge Function...');
      const { data, error } = await supabase.functions.invoke('submit-feedback', {
        body: {
          responses,
          organizationId: organization.id,
          questions,
          timingData
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      toast({
        title: "Feedback submitted successfully!",
        description: `${data.responseCount} responses recorded`,
      });

      console.log('Feedback submitted successfully:', data);
      return { id: data.sessionId, total_score: data.totalScore };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error submitting feedback",
        description: "Please try again later",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetResponses = () => {
    setResponses({});
  };

  return {
    responses,
    isSubmitting,
    handleResponse,
    loadResponses,
    generateFinalResponses,
    submitResponses,
    resetResponses,
    organizationId: organization?.id
  };
};
