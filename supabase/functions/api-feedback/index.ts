
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from './utils/cors.ts';
import { createErrorResponse, generateRandomScore } from './utils/helpers.ts';
import { validateResponse } from './utils/validation.ts';
import { logRequest, validateApiKey } from './utils/db.ts';

serve(async (req) => {
  const requestUrl = new URL(req.url);
  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || '';

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method Not Allowed', 405);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createErrorResponse('Missing or invalid Authorization header', 401);
  }
  const apiKey = authHeader.replace('Bearer ', '');

  const validationResult = await validateApiKey(supabase, apiKey);
  if (!validationResult) {
    return createErrorResponse('Invalid API Key', 401);
  }

  const { organizationId, apiKeyId } = validationResult;

  try {
    const { responses, questions, timingData, metadata } = await req.json();

    if (!responses || !questions || !Array.isArray(questions) || typeof responses !== 'object') {
      await logRequest(supabase, apiKeyId, organizationId, requestUrl.pathname, 400, ipAddress);
      return createErrorResponse('Invalid request body. "responses" (object) and "questions" (array) are required.', 400);
    }

    for (const questionId of Object.keys(responses)) {
      const value = responses[questionId];
      const question = questions.find((q: any) => q.id === questionId);

      if (!question) {
        await logRequest(supabase, apiKeyId, organizationId, requestUrl.pathname, 400, ipAddress);
        return createErrorResponse(`Question with ID "${questionId}" was not found in the provided questions list.`, 400);
      }

      const validationError = validateResponse(question, value);
      if (validationError) {
        await logRequest(supabase, apiKeyId, organizationId, requestUrl.pathname, 400, ipAddress);
        return createErrorResponse(validationError, 400);
      }
    }
    
    const { data: session, error: sessionError } = await supabase
      .from('feedback_sessions')
      .insert({
        organization_id: organizationId,
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_response_time_ms: timingData?.totalResponseTime,
        avg_question_time_ms: timingData?.averageQuestionTime,
        timing_metadata: timingData,
        metadata: metadata || null
      })
      .select()
      .single();
      
    if (sessionError) {
      await logRequest(supabase, apiKeyId, organizationId, requestUrl.pathname, 500, ipAddress);
      console.error('Error creating feedback session:', sessionError);
      throw sessionError;
    }

    const responseData = Object.entries(responses)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([questionId, value]: [string, any]) => {
        const question = questions.find((q: any) => q.id === questionId);
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
        await logRequest(supabase, apiKeyId, organizationId, requestUrl.pathname, 500, ipAddress);
        console.error('Error storing responses:', responsesError);
        throw responsesError;
      }
    }

    await logRequest(supabase, apiKeyId, organizationId, requestUrl.pathname, 201, ipAddress);
    return new Response(JSON.stringify({ success: true, sessionId: session.id }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    if (organizationId && apiKeyId) {
      await logRequest(supabase, apiKeyId, organizationId, requestUrl.pathname, 500, ipAddress);
    }
    console.error('Unexpected error in api-feedback function:', error);
    if (error instanceof SyntaxError) {
        return createErrorResponse('Invalid JSON in request body', 400);
    }
    return createErrorResponse('Internal server error', 500);
  }
});
