
const { createClient } = require('@supabase/supabase-js');

class AnalyticsController {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async getOrganizationAnalytics(req, res) {
    try {
      const { organization_id } = req.params;
      const { date_from, date_to, category } = req.query;

      if (!organization_id) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID is required'
        });
      }

      // Build date filter
      let dateFilter = '';
      const params = [organization_id];
      if (date_from) {
        dateFilter += ' AND fr.created_at >= $' + (params.length + 1);
        params.push(date_from);
      }
      if (date_to) {
        dateFilter += ' AND fr.created_at <= $' + (params.length + 1);
        params.push(date_to);
      }
      if (category) {
        dateFilter += ' AND fr.question_category = $' + (params.length + 1);
        params.push(category);
      }

      // Get comprehensive analytics
      const analyticsQuery = `
        WITH session_stats AS (
          SELECT 
            COUNT(*) as total_sessions,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
            AVG(total_score) as avg_score,
            AVG(total_response_time_ms) as avg_response_time
          FROM feedback_sessions 
          WHERE organization_id = $1 ${dateFilter.replace(/fr\./g, 'fs.')}
        ),
        response_stats AS (
          SELECT 
            COUNT(*) as total_responses,
            AVG(score) as avg_response_score,
            COUNT(DISTINCT session_id) as sessions_with_responses,
            AVG(response_time_ms) as avg_question_response_time
          FROM feedback_responses fr
          WHERE organization_id = $1 ${dateFilter}
        ),
        category_breakdown AS (
          SELECT 
            question_category,
            COUNT(*) as response_count,
            AVG(score) as avg_category_score,
            COUNT(DISTINCT session_id) as category_sessions
          FROM feedback_responses fr
          WHERE organization_id = $1 ${dateFilter}
          GROUP BY question_category
        ),
        daily_trends AS (
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as daily_responses,
            AVG(score) as daily_avg_score,
            COUNT(DISTINCT session_id) as daily_sessions
          FROM feedback_responses fr
          WHERE organization_id = $1 ${dateFilter}
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 30
        )
        SELECT 
          json_build_object(
            'session_metrics', (SELECT row_to_json(session_stats) FROM session_stats),
            'response_metrics', (SELECT row_to_json(response_stats) FROM response_stats),
            'category_breakdown', (SELECT json_agg(category_breakdown) FROM category_breakdown),
            'daily_trends', (SELECT json_agg(daily_trends) FROM daily_trends)
          ) as analytics
      `;

      const { data: analytics, error } = await this.supabase
        .rpc('execute_sql', { query: analyticsQuery, params });

      if (error) throw error;

      res.json({
        success: true,
        data: analytics[0].analytics,
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }
  }

  async getQuestionAnalytics(req, res) {
    try {
      const { organization_id } = req.params;
      const { question_id } = req.query;

      let questionFilter = '';
      const params = [organization_id];
      if (question_id) {
        questionFilter = ' AND fr.question_id = $2';
        params.push(question_id);
      }

      const { data: questions, error } = await this.supabase
        .from('questions')
        .select(`
          id,
          question_text,
          question_type,
          category,
          is_active
        `)
        .eq('organization_id', organization_id)
        .eq('is_active', true);

      if (error) throw error;

      // Get response analytics for each question
      const questionAnalytics = await Promise.all(
        questions.map(async (question) => {
          const { data: responses } = await this.supabase
            .from('feedback_responses')
            .select('score, response_value, created_at, response_time_ms')
            .eq('organization_id', organization_id)
            .eq('question_id', question.id);

          const totalResponses = responses?.length || 0;
          const avgScore = responses?.length > 0 
            ? responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length
            : 0;
          const avgResponseTime = responses?.length > 0
            ? responses.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / responses.length
            : 0;

          // Calculate response distribution
          const responseDistribution = {};
          responses?.forEach(response => {
            const value = JSON.stringify(response.response_value);
            responseDistribution[value] = (responseDistribution[value] || 0) + 1;
          });

          return {
            question_id: question.id,
            question_text: question.question_text,
            question_type: question.question_type,
            category: question.category,
            total_responses: totalResponses,
            avg_score: Math.round(avgScore * 100) / 100,
            avg_response_time_ms: Math.round(avgResponseTime),
            response_distribution: responseDistribution,
            completion_rate: totalResponses // This would need session count for accurate calculation
          };
        })
      );

      res.json({
        success: true,
        data: questionAnalytics
      });
    } catch (error) {
      console.error('Get question analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch question analytics'
      });
    }
  }

  async getRealTimeMetrics(req, res) {
    try {
      const { organization_id } = req.params;
      const timeWindow = req.query.window || '1h'; // 1h, 6h, 24h

      let timeFilter = '';
      switch (timeWindow) {
        case '1h':
          timeFilter = "AND created_at >= NOW() - INTERVAL '1 hour'";
          break;
        case '6h':
          timeFilter = "AND created_at >= NOW() - INTERVAL '6 hours'";
          break;
        case '24h':
          timeFilter = "AND created_at >= NOW() - INTERVAL '24 hours'";
          break;
        default:
          timeFilter = "AND created_at >= NOW() - INTERVAL '1 hour'";
      }

      // Get active sessions
      const { data: activeSessions } = await this.supabase
        .from('feedback_sessions')
        .select('id')
        .eq('organization_id', organization_id)
        .eq('status', 'in_progress')
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());

      // Get recent responses
      const { data: recentResponses } = await this.supabase
        .from('feedback_responses')
        .select('score, created_at')
        .eq('organization_id', organization_id)
        .gte('created_at', new Date(Date.now() - parseInt(timeWindow) * 60 * 60 * 1000).toISOString());

      const avgScore = recentResponses?.length > 0
        ? recentResponses.reduce((sum, r) => sum + (r.score || 0), 0) / recentResponses.length
        : 0;

      res.json({
        success: true,
        data: {
          active_sessions: activeSessions?.length || 0,
          recent_responses: recentResponses?.length || 0,
          avg_score: Math.round(avgScore * 100) / 100,
          time_window: timeWindow,
          last_updated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Get real-time metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch real-time metrics'
      });
    }
  }

  async getSentimentAnalysis(req, res) {
    try {
      const { organization_id } = req.params;

      // Get all text responses for sentiment analysis
      const { data: responses } = await this.supabase
        .from('feedback_responses')
        .select('response_value, score, question_category, created_at')
        .eq('organization_id', organization_id)
        .not('response_value', 'is', null);

      if (!responses || responses.length === 0) {
        return res.json({
          success: true,
          data: {
            overall_sentiment: 'neutral',
            sentiment_score: 0,
            category_sentiments: [],
            insights: ['Not enough data for sentiment analysis']
          }
        });
      }

      // Simple sentiment analysis based on scores and keywords
      const sentimentAnalysis = {
        positive: 0,
        neutral: 0,
        negative: 0
      };

      const categoryAnalysis = {};

      responses.forEach(response => {
        const score = response.score || 0;
        const category = response.question_category || 'general';
        const text = typeof response.response_value === 'string' 
          ? response.response_value.toLowerCase() 
          : '';

        // Simple sentiment classification
        let sentiment = 'neutral';
        if (score >= 4 || text.includes('good') || text.includes('great') || text.includes('excellent')) {
          sentiment = 'positive';
        } else if (score <= 2 || text.includes('bad') || text.includes('poor') || text.includes('terrible')) {
          sentiment = 'negative';
        }

        sentimentAnalysis[sentiment]++;

        if (!categoryAnalysis[category]) {
          categoryAnalysis[category] = { positive: 0, neutral: 0, negative: 0 };
        }
        categoryAnalysis[category][sentiment]++;
      });

      const total = responses.length;
      const overallScore = (sentimentAnalysis.positive - sentimentAnalysis.negative) / total;

      res.json({
        success: true,
        data: {
          overall_sentiment: overallScore > 0.1 ? 'positive' : overallScore < -0.1 ? 'negative' : 'neutral',
          sentiment_score: Math.round(overallScore * 100) / 100,
          sentiment_distribution: {
            positive: Math.round((sentimentAnalysis.positive / total) * 100),
            neutral: Math.round((sentimentAnalysis.neutral / total) * 100),
            negative: Math.round((sentimentAnalysis.negative / total) * 100)
          },
          category_sentiments: Object.keys(categoryAnalysis).map(category => ({
            category,
            positive: categoryAnalysis[category].positive,
            neutral: categoryAnalysis[category].neutral,
            negative: categoryAnalysis[category].negative
          })),
          total_analyzed: total,
          insights: this.generateSentimentInsights(sentimentAnalysis, total)
        }
      });
    } catch (error) {
      console.error('Get sentiment analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform sentiment analysis'
      });
    }
  }

  generateSentimentInsights(analysis, total) {
    const insights = [];
    const positivePercent = (analysis.positive / total) * 100;
    const negativePercent = (analysis.negative / total) * 100;

    if (positivePercent > 70) {
      insights.push('Overwhelmingly positive feedback - customers are very satisfied');
    } else if (positivePercent > 50) {
      insights.push('Generally positive feedback with room for improvement');
    }

    if (negativePercent > 30) {
      insights.push('Significant negative feedback requires immediate attention');
    } else if (negativePercent > 15) {
      insights.push('Some areas of concern identified in customer feedback');
    }

    if (insights.length === 0) {
      insights.push('Mixed feedback patterns - monitor trends closely');
    }

    return insights;
  }

  async exportAnalytics(req, res) {
    try {
      const { organization_id } = req.params;
      const { format = 'json', date_from, date_to } = req.query;

      // Get comprehensive data for export
      let dateFilter = {};
      if (date_from) dateFilter.gte = { created_at: date_from };
      if (date_to) dateFilter.lte = { created_at: date_to };

      const { data: sessions } = await this.supabase
        .from('feedback_sessions')
        .select('*')
        .eq('organization_id', organization_id)
        .order('created_at', { ascending: false });

      const { data: responses } = await this.supabase
        .from('feedback_responses')
        .select('*')
        .eq('organization_id', organization_id)
        .order('created_at', { ascending: false });

      const exportData = {
        export_info: {
          organization_id,
          generated_at: new Date().toISOString(),
          total_sessions: sessions?.length || 0,
          total_responses: responses?.length || 0,
          date_range: { from: date_from, to: date_to }
        },
        sessions: sessions || [],
        responses: responses || []
      };

      if (format === 'csv') {
        // Convert to CSV format
        const csv = this.convertToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${organization_id}-${Date.now()}.csv"`);
        res.send(csv);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${organization_id}-${Date.now()}.json"`);
        res.json({
          success: true,
          data: exportData
        });
      }
    } catch (error) {
      console.error('Export analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export analytics'
      });
    }
  }

  convertToCSV(data) {
    // Simple CSV conversion for responses
    const headers = ['Session ID', 'Question ID', 'Response Value', 'Score', 'Category', 'Created At'];
    const rows = data.responses.map(response => [
      response.session_id,
      response.question_id,
      JSON.stringify(response.response_value),
      response.score || '',
      response.question_category,
      response.created_at
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

module.exports = { AnalyticsController };
