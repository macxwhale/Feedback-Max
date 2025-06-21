
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('SMS Webhook received')
    
    const formData = await req.formData()
    const from = formData.get('from')?.toString()
    const text = formData.get('text')?.toString()
    const to = formData.get('to')?.toString()
    const id = formData.get('id')?.toString()
    const date = formData.get('date')?.toString()

    console.log('SMS Data:', { from, text, to, id, date })

    if (!from || !text) {
      console.error('Missing required SMS data')
      return new Response('Missing data', { status: 400, headers: corsHeaders })
    }

    // Find organization by sender ID or webhook
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name, sms_settings, sms_sender_id')
      .eq('sms_enabled', true)
      .single()

    if (!org) {
      console.error('No SMS-enabled organization found')
      return new Response('Organization not found', { status: 404, headers: corsHeaders })
    }

    console.log(`Processing SMS for organization: ${org.id}`)

    // Check for existing SMS session
    let { data: smsSession } = await supabase
      .from('sms_sessions')
      .select('*')
      .eq('phone_number', from)
      .eq('organization_id', org.id)
      .eq('status', 'started')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let responseText = ''
    let shouldCreateSession = false

    // Handle START command or create new session
    if (!smsSession && (text.toLowerCase().includes('start') || text.toLowerCase().includes('begin'))) {
      shouldCreateSession = true
    } else if (!smsSession) {
      // No active session and not a start command
      responseText = `Hi! To begin our quick survey, please reply "START". Thank you! - ${org.name}`
    } else {
      // Process response for existing session
      responseText = await processQuestionResponse(supabase, smsSession, text, org)
    }

    // Create new session if needed
    if (shouldCreateSession) {
      console.log('Creating new SMS session')
      
      // Create feedback session first
      const { data: feedbackSession, error: feedbackError } = await supabase
        .from('feedback_sessions')
        .insert({
          organization_id: org.id,
          phone_number: from,
          status: 'in_progress'
        })
        .select()
        .single()

      if (feedbackError) {
        console.error('Error creating feedback session:', feedbackError)
        throw feedbackError
      }

      // Create SMS session
      const { data: newSmsSession, error: sessionError } = await supabase
        .from('sms_sessions')
        .insert({
          organization_id: org.id,
          phone_number: from,
          feedback_session_id: feedbackSession.id,
          current_question_index: 0,
          responses: {},
          status: 'started'
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Error creating SMS session:', sessionError)
        throw sessionError
      }

      smsSession = newSmsSession
      responseText = await getNextQuestion(supabase, smsSession, org)
    }

    // Log the conversation
    await supabase
      .from('sms_conversations')
      .insert({
        sms_session_id: smsSession?.id,
        direction: 'inbound',
        content: text,
        africastalking_message_id: id
      })

    // Send response if we have one
    if (responseText && org.sms_settings?.username && org.sms_settings?.apiKey) {
      await sendSMSResponse(org, from, responseText, supabase, smsSession?.id)
    }

    return new Response('OK', { headers: corsHeaders })

  } catch (error) {
    console.error('Error processing SMS webhook:', error)
    return new Response('Error', { status: 500, headers: corsHeaders })
  }
})

async function processQuestionResponse(supabase: any, smsSession: any, text: string, org: any) {
  console.log(`Processing response for session ${smsSession.id}, question index: ${smsSession.current_question_index}`)
  
  // Get current question
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .order('order_index')

  if (!questions || questions.length === 0) {
    return `Thank you for your interest! We don't have any questions set up yet. - ${org.name}`
  }

  const currentQuestion = questions[smsSession.current_question_index]
  
  if (!currentQuestion) {
    // All questions completed
    await completeSurvey(supabase, smsSession, org)
    return `Thank you for completing our survey! Your feedback is valuable to us. - ${org.name}`
  }

  // Store the response
  const responses = { ...smsSession.responses }
  responses[currentQuestion.id] = text

  // Create feedback response record
  const { error: responseError } = await supabase
    .from('feedback_responses')
    .insert({
      session_id: smsSession.feedback_session_id,
      question_id: currentQuestion.id,
      organization_id: org.id,
      response_value: text,
      question_category: currentQuestion.category || 'General',
      score: generateScoreFromResponse(text, currentQuestion.question_type)
    })

  if (responseError) {
    console.error('Error storing response:', responseError)
  }

  // Move to next question
  const nextQuestionIndex = smsSession.current_question_index + 1
  
  await supabase
    .from('sms_sessions')
    .update({
      current_question_index: nextQuestionIndex,
      responses: responses
    })
    .eq('id', smsSession.id)

  // Get next question or complete survey
  if (nextQuestionIndex >= questions.length) {
    await completeSurvey(supabase, smsSession, org)
    return `Thank you for completing our survey! Your feedback helps us improve. - ${org.name}`
  }

  // Send next question
  const nextQuestion = questions[nextQuestionIndex]
  return formatQuestionForSMS(nextQuestion, nextQuestionIndex + 1, questions.length)
}

async function getNextQuestion(supabase: any, smsSession: any, org: any) {
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('organization_id', org.id)
    .eq('is_active', true)
    .order('order_index')

  if (!questions || questions.length === 0) {
    return `Thank you for your interest! We don't have any questions set up yet. - ${org.name}`
  }

  const firstQuestion = questions[0]
  return `Welcome to our survey! ${formatQuestionForSMS(firstQuestion, 1, questions.length)}`
}

function formatQuestionForSMS(question: any, questionNum: number, totalQuestions: number) {
  let formattedQuestion = `Q${questionNum}/${totalQuestions}: ${question.question_text}`
  
  // Add options for multiple choice questions
  if (question.question_type === 'multiple_choice') {
    // Get options from question_options table would require another query
    // For now, we'll include basic instruction
    formattedQuestion += '\n\nPlease reply with your choice.'
  } else if (question.question_type === 'rating') {
    formattedQuestion += '\n\nPlease rate from 1-5 (1=Poor, 5=Excellent)'
  }
  
  return formattedQuestion
}

function generateScoreFromResponse(response: string, questionType: string) {
  // Simple scoring logic - can be enhanced
  if (questionType === 'rating') {
    const rating = parseInt(response)
    return isNaN(rating) ? 3 : Math.max(1, Math.min(5, rating))
  }
  
  // Default scoring for text responses
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful']
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'poor']
  
  const lowerResponse = response.toLowerCase()
  const hasPositive = positiveWords.some(word => lowerResponse.includes(word))
  const hasNegative = negativeWords.some(word => lowerResponse.includes(word))
  
  if (hasPositive && !hasNegative) return 5
  if (hasNegative && !hasPositive) return 1
  return 3 // Neutral
}

async function completeSurvey(supabase: any, smsSession: any, org: any) {
  console.log(`Completing survey for session ${smsSession.id}`)
  
  // Update SMS session status
  await supabase
    .from('sms_sessions')
    .update({ status: 'completed' })
    .eq('id', smsSession.id)

  // Update feedback session
  await supabase
    .from('feedback_sessions')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
     })
    .eq('id', smsSession.feedback_session_id)

  console.log('Survey completed successfully')
}

async function sendSMSResponse(org: any, to: string, message: string, supabase: any, sessionId?: string) {
  try {
    console.log(`Sending SMS response to ${to}`)
    
    const atData = new URLSearchParams()
    atData.append('username', org.sms_settings.username)
    atData.append('to', to)
    atData.append('message', message)
    if (org.sms_sender_id) {
      atData.append('from', org.sms_sender_id)
    }

    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'apiKey': org.sms_settings.apiKey
      },
      body: atData.toString()
    })

    const result = await response.text()
    console.log('SMS send result:', result)

    // Log outbound conversation
    if (sessionId) {
      await supabase
        .from('sms_conversations')
        .insert({
          sms_session_id: sessionId,
          direction: 'outbound',
          content: message
        })
    }

  } catch (error) {
    console.error('Error sending SMS response:', error)
  }
}
