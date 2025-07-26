
const { createClient } = require('@supabase/supabase-js');

class FeedbackController {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async createFeedbackSession(req, res) {
    try {
      const { organization_id, user_id, phone_number, metadata } = req.body;

      if (!organization_id) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID is required'
        });
      }

      const sessionData = {
        organization_id,
        user_id,
        phone_number,
        metadata: metadata || {},
        status: 'in_progress',
        started_at: new Date().toISOString()
      };

      const { data: session, error } = await this.supabase
        .from('feedback_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: session,
        message: 'Feedback session created successfully'
      });
    } catch (error) {
      console.error('Create feedback session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create feedback session'
      });
    }
  }

  async getFeedbackSession(req, res) {
    try {
      const { id } = req.params;

      const { data: session, error } = await this.supabase
        .from('feedback_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Feedback session not found'
        });
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      console.error('Get feedback session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feedback session'
      });
    }
  }

  async updateFeedbackSession(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove id from updates if present
      delete updates.id;

      const { data: session, error } = await this.supabase
        .from('feedback_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Feedback session not found'
        });
      }

      res.json({
        success: true,
        data: session,
        message: 'Feedback session updated successfully'
      });
    } catch (error) {
      console.error('Update feedback session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update feedback session'
      });
    }
  }

  async createFeedbackResponse(req, res) {
    try {
      const {
        session_id,
        question_id,
        organization_id,
        response_value,
        score,
        question_category,
        response_time_ms
      } = req.body;

      if (!session_id || !question_id || !organization_id || response_value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Session ID, question ID, organization ID, and response value are required'
        });
      }

      const responseData = {
        session_id,
        question_id,
        organization_id,
        response_value,
        score,
        question_category: question_category || 'general',
        response_time_ms,
        question_started_at: new Date(Date.now() - (response_time_ms || 0)).toISOString(),
        question_completed_at: new Date().toISOString()
      };

      const { data: response, error } = await this.supabase
        .from('feedback_responses')
        .insert(responseData)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: response,
        message: 'Feedback response created successfully'
      });
    } catch (error) {
      console.error('Create feedback response error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create feedback response'
      });
    }
  }

  async getFeedbackResponses(req, res) {
    try {
      const { session_id, organization_id, limit = 50, offset = 0 } = req.query;

      let query = this.supabase
        .from('feedback_responses')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (session_id) {
        query = query.eq('session_id', session_id);
      }

      if (organization_id) {
        query = query.eq('organization_id', organization_id);
      }

      const { data: responses, error } = await query;

      if (error) throw error;

      res.json({
        success: true,
        data: responses || []
      });
    } catch (error) {
      console.error('Get feedback responses error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch feedback responses'
      });
    }
  }

  async getQuestions(req, res) {
    try {
      const { organization_id } = req.query;

      if (!organization_id) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID is required'
        });
      }

      const { data: questions, error } = await this.supabase
        .from('questions')
        .select(`
          *,
          question_options(*),
          question_scale_config(*)
        `)
        .eq('organization_id', organization_id)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

      res.json({
        success: true,
        data: questions || []
      });
    } catch (error) {
      console.error('Get questions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch questions'
      });
    }
  }

  async createQuestion(req, res) {
    try {
      const {
        organization_id,
        question_text,
        question_type,
        category,
        category_id,
        type_id,
        order_index,
        is_required,
        validation_rules,
        conditional_logic,
        placeholder_text,
        help_text
      } = req.body;

      if (!organization_id || !question_text || !question_type) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID, question text, and question type are required'
        });
      }

      const questionData = {
        organization_id,
        question_text,
        question_type,
        category: category || 'general',
        category_id,
        type_id,
        order_index: order_index || 0,
        is_required: is_required || false,
        validation_rules: validation_rules || {},
        conditional_logic: conditional_logic || {},
        placeholder_text,
        help_text,
        is_active: true
      };

      const { data: question, error } = await this.supabase
        .from('questions')
        .insert(questionData)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: question,
        message: 'Question created successfully'
      });
    } catch (error) {
      console.error('Create question error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create question'
      });
    }
  }

  async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove id from updates if present
      delete updates.id;

      const { data: question, error } = await this.supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!question) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      res.json({
        success: true,
        data: question,
        message: 'Question updated successfully'
      });
    } catch (error) {
      console.error('Update question error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update question'
      });
    }
  }

  async deleteQuestion(req, res) {
    try {
      const { id } = req.params;

      // Use safe delete function that handles responses
      const { data: result, error } = await this.supabase
        .rpc('safe_delete_question', {
          question_uuid: id
        });

      if (error) throw error;

      const message = result 
        ? 'Question deleted successfully'
        : 'Question archived (had responses)';

      res.json({
        success: true,
        data: { deleted: result, archived: !result },
        message
      });
    } catch (error) {
      console.error('Delete question error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete question'
      });
    }
  }
}

module.exports = { FeedbackController };
