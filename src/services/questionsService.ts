
import { supabase } from '@/integrations/supabase/client';

const FUNCTION_URL = 'https://rigurrwjiaucodxuuzeh.supabase.co/functions/v1/questions-crud';

interface QuestionFormData {
  question_text: string;
  question_type: string;
  category: string;
  order_index: number;
  help_text?: string;
  placeholder_text?: string;
  is_required?: boolean;
  options?: { text: string; value?: string }[];
  scaleConfig?: {
    minValue: number;
    maxValue: number;
    minLabel?: string;
    maxLabel?: string;
    stepSize?: number;
  };
}

// Helper to get auth headers
const getAuthHeaders = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) {
    throw new Error('Authentication required');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
};

// Helper to handle API responses with improved error handling
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    // Log detailed error for debugging
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    
    const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }
  
  try {
    return await response.json();
  } catch (error) {
    console.error('Error parsing response JSON:', error);
    throw new Error('Invalid response format from server');
  }
};

// Transform database question to frontend format
const transformQuestion = (dbQuestion: any) => {
  return {
    id: dbQuestion.id,
    type: dbQuestion.question_type,
    question: dbQuestion.question_text,
    required: dbQuestion.is_required || false,
    category: dbQuestion.category,
    options: dbQuestion.question_options?.map((opt: any) => opt.option_text) || [],
    scale: dbQuestion.question_scale_config?.[0] ? {
      min: dbQuestion.question_scale_config[0].min_value,
      max: dbQuestion.question_scale_config[0].max_value,
      minLabel: dbQuestion.question_scale_config[0].min_label,
      maxLabel: dbQuestion.question_scale_config[0].max_label
    } : undefined
  };
};

// Generate random score for testing/demo purposes
export const generateRandomScore = (): number => {
  return Math.floor(Math.random() * 5) + 1;
};

// Store feedback responses in database
export const storeFeedbackResponses = async (
  responses: Record<string, any>,
  organizationId: string,
  questions: any[]
) => {
  try {
    // Create a feedback session
    const { data: session, error: sessionError } = await supabase
      .from('feedback_sessions')
      .insert({
        organization_id: organizationId,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating feedback session:', sessionError);
      throw sessionError;
    }

    // Store individual responses
    const responseData = Object.entries(responses)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([questionId, value]) => {
        const question = questions.find(q => q.id === questionId);
        return {
          question_id: questionId,
          session_id: session.id,
          organization_id: organizationId,
          response_value: value,
          question_category: question?.category || 'Comments',
          score: generateRandomScore()
        };
      });

    if (responseData.length > 0) {
      const { error: responsesError } = await supabase
        .from('feedback_responses')
        .insert(responseData);

      if (responsesError) {
        console.error('Error storing responses:', responsesError);
        throw responsesError;
      }
    }

    console.log('Feedback responses stored successfully:', responseData.length, 'responses');
    return session;
  } catch (error) {
    console.error('Error in storeFeedbackResponses:', error);
    throw error;
  }
};

// Fetch questions for frontend form (optimized for user feedback)
export const fetchQuestions = async (organizationSlug?: string) => {
  if (!organizationSlug) {
    console.warn('fetchQuestions called without organizationSlug');
    return [];
  }
  try {
    const { data, error } = await supabase.functions.invoke('public-questions', {
      body: { organizationSlug },
    });

    if (error) {
      console.error('Error fetching questions for form:', error);
      throw error;
    }
    
    return data.map(transformQuestion);
  } catch (error) {
    console.error('Error fetching questions for form:', error);
    throw error;
  }
};

// Main questions service for admin operations
export const questionsService = {
  async getQuestions() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(FUNCTION_URL, {
        method: 'GET',
        headers
      });
      
      const data = await handleResponse(response);
      console.log('Successfully fetched questions:', data?.length || 0);
      return data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  async createQuestion(question: QuestionFormData) {
    try {
      console.log('Creating question:', question);
      const headers = await getAuthHeaders();
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(question)
      });
      
      const data = await handleResponse(response);
      console.log('Successfully created question:', data?.id);
      return data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  async updateQuestion(id: string, updates: QuestionFormData) {
    try {
      console.log('Updating question:', id, updates);
      const headers = await getAuthHeaders();
      const response = await fetch(FUNCTION_URL, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id, ...updates })
      });
      
      const data = await handleResponse(response);
      console.log('Successfully updated question:', data?.id);
      return data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  async deleteQuestion(id: string) {
    try {
      console.log('Deleting question:', id);
      
      // Use the safe deletion function
      const { data, error } = await supabase.rpc('safe_delete_question', {
        question_uuid: id
      });

      if (error) {
        console.error('Error deleting question:', error);
        throw error;
      }

      // data will be true if actually deleted, false if archived
      const result = { deleted: data, archived: !data };
      console.log('Question deletion result:', result);
      return result;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  async getQuestionTypes() {
    try {
      const { data, error } = await supabase
        .from('question_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching question types:', error);
        throw error;
      }
      
      console.log('Successfully fetched question types:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching question types:', error);
      return [];
    }
  },

  async getQuestionCategories() {
    try {
      const { data, error } = await supabase
        .from('question_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching question categories:', error);
        throw error;
      }
      
      console.log('Successfully fetched question categories:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching question categories:', error);
      return [];
    }
  }
};
