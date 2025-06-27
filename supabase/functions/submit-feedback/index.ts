
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeedbackSubmission {
  responses: Record<string, any>;
  organizationId: string;
  questions: any[];
  timingData?: {
    sessionStartTime: number;
    sessionEndTime: number;
    totalResponseTime: number;
    averageQuestionTime: number;
    questionTimes: Record<string, number>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { responses, organizationId, questions, timingData }: FeedbackSubmission = await req.json()

    console.log('Submitting feedback:', { organizationId, responseCount: Object.keys(responses).length })

    // Create feedback session with web origin
    const sessionMetadata = {
      origin: 'web',
      user_agent: req.headers.get('user-agent'),
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    }

    // Add timing data if available
    if (timingData) {
      sessionMetadata.timing = timingData
    }

    const { data: session, error: sessionError } = await supabase
      .from('feedback_sessions')
      .insert({
        organization_id: organizationId,
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: sessionMetadata,
        timing_metadata: timingData || null,
        total_response_time_ms: timingData?.totalResponseTime || null,
        avg_question_time_ms: timingData?.averageQuestionTime || null
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating feedback session:', sessionError)
      throw new Error('Failed to create feedback session')
    }

    console.log('Created feedback session:', session.id)

    // Process responses and create feedback_responses records
    const responsePromises = Object.entries(responses).map(async ([questionId, value]) => {
      const question = questions.find(q => q.id === questionId)
      if (!question) {
        console.warn(`Question ${questionId} not found in provided questions`)
        return null
      }

      // Calculate score based on response type
      let score = null
      if (typeof value === 'number') {
        score = value
      } else if (question.question_type === 'star' || question.question_type === 'nps') {
        score = parseInt(value) || null
      }

      // Create question snapshot
      const questionSnapshot = {
        id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        category: question.category,
        is_required: question.is_required,
        order_index: question.order_index,
        organization_id: question.organization_id,
        captured_at: new Date().toISOString(),
        options: question.options || [],
        scale: question.scale || null
      }

      return await supabase
        .from('feedback_responses')
        .insert({
          session_id: session.id,
          organization_id: organizationId,
          question_id: questionId,
          question_category: question.category || 'QualityService',
          response_value: value,
          score: score,
          question_snapshot: questionSnapshot,
          question_text_snapshot: question.question_text,
          question_type_snapshot: question.question_type,
          response_time_ms: timingData?.questionTimes?.[questionId] || null
        })
    })

    const responseResults = await Promise.all(responsePromises.filter(p => p !== null))
    const failedResponses = responseResults.filter(result => result.error)
    
    if (failedResponses.length > 0) {
      console.error('Some responses failed to save:', failedResponses)
    }

    const successfulResponses = responseResults.filter(result => !result.error)
    console.log(`Saved ${successfulResponses.length} responses`)

    // Calculate total score
    const totalScore = successfulResponses.reduce((sum, result) => {
      const score = result.data?.score
      return sum + (typeof score === 'number' ? score : 0)
    }, 0)

    // Update session with total score
    await supabase
      .from('feedback_sessions')
      .update({ total_score: totalScore > 0 ? totalScore : null })
      .eq('id', session.id)

    return new Response(JSON.stringify({
      success: true,
      sessionId: session.id,
      responseCount: successfulResponses.length,
      totalScore: totalScore > 0 ? totalScore : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Submit feedback error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
