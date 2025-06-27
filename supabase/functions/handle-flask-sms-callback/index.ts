import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlaskSmsCallback {
  linkId: string;
  text: string;
  to: string; // Sender ID that identifies the organization
  id: string;
  date: string;
  from: string; // Phone number
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  // Compare without timing attacks
  let result = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    result |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0 && expectedSignature.length === signature.length;
}

async function sendSmsResponse(supabase: any, org: any, phoneNumber: string, message: string, senderId: string) {
  try {
    // Get Flask wrapper URL
    const { data: settingData } = await supabase
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', 'flask_sms_wrapper_base_url')
      .single()

    const flaskWrapperUrl = settingData?.setting_value?.replace(/\/$/, '');
    
    if (flaskWrapperUrl && org.sms_settings) {
      const smsSettings = typeof org.sms_settings === 'string' 
        ? JSON.parse(org.sms_settings) 
        : org.sms_settings

      const requestData = {
        org_id: org.id,
        recipients: [phoneNumber],
        message: message,
        sender: senderId,
        username: smsSettings.username,
        api_key: smsSettings.apiKey
      }

      // Create signature for Flask API
      const webhookSecret = org.webhook_secret || 'changeme';
      const requestBody = JSON.stringify(requestData);
      const signature = createHmac('sha256', webhookSecret)
        .update(requestBody)
        .digest('hex');

      const response = await fetch(`${flaskWrapperUrl}/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
        },
        body: requestBody
      })

      if (!response.ok) {
        console.error('Failed to send response via Flask API:', response.status, response.statusText)
        return false
      } else {
        console.log('Response sent successfully via Flask API')
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Error sending response via Flask API:', error)
    return false
  }
}

async function getOrganizationQuestions(supabase: any, organizationId: string) {
  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      question_type,
      is_required,
      order_index,
      category,
      question_options (
        id,
        option_text,
        option_value,
        display_order
      ),
      question_scale_config (
        min_value,
        max_value,
        min_label,
        max_label
      )
    `)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }

  return questions || []
}

function formatQuestionForSms(question: any, questionNumber: number): string {
  let message = `Q${questionNumber}: ${question.question_text}\n\n`
  
  if (question.question_type === 'single-choice' && question.question_options) {
    question.question_options
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .forEach((option: any, index: number) => {
        message += `${index + 1}. ${option.option_text}\n`
      })
    message += '\nReply with the number of your choice.'
  } else if (question.question_type === 'star' || question.question_type === 'nps') {
    const scale = question.question_scale_config?.[0]
    if (scale) {
      message += `Rate from ${scale.min_value} to ${scale.max_value}\n`
      if (scale.min_label) message += `${scale.min_value} = ${scale.min_label}\n`
      if (scale.max_label) message += `${scale.max_value} = ${scale.max_label}\n`
    }
    message += '\nReply with a number.'
  } else if (question.question_type === 'text') {
    message += 'Please type your response.'
  }
  
  return message
}

function validateResponse(question: any, userResponse: string): { isValid: boolean, value: any, error?: string } {
  const trimmedResponse = userResponse.trim()
  
  if (question.question_type === 'single-choice' && question.question_options) {
    const choiceNumber = parseInt(trimmedResponse)
    const options = question.question_options.sort((a: any, b: any) => a.display_order - b.display_order)
    
    if (isNaN(choiceNumber) || choiceNumber < 1 || choiceNumber > options.length) {
      return { 
        isValid: false, 
        value: null, 
        error: `Please reply with a number between 1 and ${options.length}` 
      }
    }
    
    return { 
      isValid: true, 
      value: options[choiceNumber - 1].option_value || options[choiceNumber - 1].option_text 
    }
  } else if (question.question_type === 'star' || question.question_type === 'nps') {
    const rating = parseInt(trimmedResponse)
    const scale = question.question_scale_config?.[0]
    
    if (scale) {
      if (isNaN(rating) || rating < scale.min_value || rating > scale.max_value) {
        return { 
          isValid: false, 
          value: null, 
          error: `Please reply with a number between ${scale.min_value} and ${scale.max_value}` 
        }
      }
    } else {
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return { 
          isValid: false, 
          value: null, 
          error: 'Please reply with a number between 1 and 5' 
        }
      }
    }
    
    return { isValid: true, value: rating }
  } else if (question.question_type === 'text') {
    if (trimmedResponse.length === 0) {
      return { 
        isValid: false, 
        value: null, 
        error: 'Please provide a response' 
      }
    }
    return { isValid: true, value: trimmedResponse }
  }
  
  return { isValid: true, value: trimmedResponse }
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

    const body = await req.text();
    
    // Parse the JSON and handle potential parsing errors
    let callback: FlaskSmsCallback;
    try {
      callback = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse callback JSON:', parseError, 'Body:', body);
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Flask SMS callback received (raw):', body);
    console.log('Flask SMS callback parsed:', callback);

    // Validate required fields
    if (!callback.to || !callback.from || !callback.text) {
      console.error('Missing required fields in callback:', {
        to: callback.to,
        from: callback.from,
        text: callback.text
      });
      return new Response(JSON.stringify({ error: 'Missing required fields: to, from, or text' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { linkId, text, to: senderId, id: messageId, date, from: phoneNumber } = callback

    console.log('Processing SMS callback:', {
      sender_id: senderId,
      from_number: phoneNumber,
      text: text,
      timestamp: date,
      link_id: linkId,
      message_id: messageId
    });

    // Find organization by SMS sender ID
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('sms_sender_id', senderId)
      .single()

    if (orgError || !org) {
      console.error('Error finding organization by sender ID:', senderId, orgError)
      return new Response(JSON.stringify({ error: 'Organization not found for sender ID: ' + senderId }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Found organization:', org.name, 'for sender ID:', senderId)

    // Verify signature if provided
    const providedSignature = req.headers.get('X-Signature');
    if (providedSignature) {
      const webhookSecret = org.webhook_secret || 'changeme';
      if (!verifySignature(body, providedSignature, webhookSecret)) {
        console.error('Invalid signature provided');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Get or create conversation progress
    let { data: progress, error: progressError } = await supabase
      .from('sms_conversation_progress')
      .select('*')
      .eq('organization_id', org.id)
      .eq('phone_number', phoneNumber)
      .eq('sender_id', senderId)
      .maybeSingle() // Use maybeSingle to avoid errors when no rows found

    if (progressError) {
      console.error('Error fetching conversation progress:', progressError)
      return new Response(JSON.stringify({ error: 'Database error while fetching conversation progress' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!progress) {
      // No conversation progress found, create new one
      console.log('Creating new conversation progress for:', phoneNumber)
      const { data: newProgress, error: createError } = await supabase
        .from('sms_conversation_progress')
        .insert({
          organization_id: org.id,
          phone_number: phoneNumber,
          sender_id: senderId,
          current_step: 'consent',
          consent_given: false,
          session_data: {}
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating conversation progress:', createError)
        return new Response(JSON.stringify({ error: 'Failed to create conversation progress' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      progress = newProgress
    }

    // Log the conversation
    await supabase
      .from('sms_conversations')
      .insert({
        sms_session_id: progress.id,
        direction: 'inbound',
        content: text,
        status: 'received',
        africastalking_message_id: messageId
      })

    // Handle different conversation steps
    let nextStep = progress.current_step
    let responseMessage = ''
    let sessionData = { ...progress.session_data }

    switch (progress.current_step) {
      case 'consent':
        const consentResponse = text.toLowerCase().trim()
        if (consentResponse === '1' || consentResponse === 'yes' || consentResponse === 'y') {
          // Get first question
          const questions = await getOrganizationQuestions(supabase, org.id)
          if (questions.length > 0) {
            nextStep = 'question_0'
            sessionData.consent_given = true
            sessionData.questions = questions
            sessionData.current_question_index = 0
            sessionData.responses = {}
            
            // Create feedback session with SMS origin
            const { data: feedbackSession, error: sessionError } = await supabase
              .from('feedback_sessions')
              .insert({
                organization_id: org.id,
                phone_number: phoneNumber,
                status: 'in_progress',
                metadata: { 
                  origin: 'sms',
                  sender_id: senderId,
                  session_id: progress.id
                }
              })
              .select()
              .single()

            if (!sessionError) {
              sessionData.feedback_session_id = feedbackSession.id
            }

            responseMessage = formatQuestionForSms(questions[0], 1)
          } else {
            responseMessage = 'Thank you for your interest! We currently have no questions available.'
            nextStep = 'completed'
          }
        } else {
          responseMessage = 'Thank you for your time. Have a great day!'
          nextStep = 'completed'
        }
        break

      case 'question_0':
      case 'question_1':
      case 'question_2':
      case 'question_3':
      case 'question_4':
      case 'question_5':
      case 'question_6':
      case 'question_7':
      case 'question_8':
      case 'question_9':
        // Extract current question index
        const currentQuestionIndex = parseInt(progress.current_step.replace('question_', ''))
        const questions = sessionData.questions || []
        
        if (currentQuestionIndex < questions.length) {
          const currentQuestion = questions[currentQuestionIndex]
          const validation = validateResponse(currentQuestion, text)
          
          if (!validation.isValid) {
            responseMessage = validation.error + '\n\n' + formatQuestionForSms(currentQuestion, currentQuestionIndex + 1)
            // Don't change step, keep asking the same question
          } else {
            // Store the response
            sessionData.responses = sessionData.responses || {}
            sessionData.responses[currentQuestion.id] = validation.value
            
            // Save response to database
            if (sessionData.feedback_session_id) {
              await supabase
                .from('feedback_responses')
                .insert({
                  session_id: sessionData.feedback_session_id,
                  organization_id: org.id,
                  question_id: currentQuestion.id,
                  question_category: currentQuestion.category || 'QualityService',
                  response_value: validation.value,
                  score: typeof validation.value === 'number' ? validation.value : null,
                  question_snapshot: {
                    id: currentQuestion.id,
                    question_text: currentQuestion.question_text,
                    question_type: currentQuestion.question_type,
                    category: currentQuestion.category,
                    options: currentQuestion.question_options,
                    scale: currentQuestion.question_scale_config
                  }
                })
            }
            
            // Move to next question or complete
            const nextQuestionIndex = currentQuestionIndex + 1
            if (nextQuestionIndex < questions.length) {
              nextStep = `question_${nextQuestionIndex}`
              responseMessage = formatQuestionForSms(questions[nextQuestionIndex], nextQuestionIndex + 1)
            } else {
              nextStep = 'completed'
              
              // Complete feedback session
              if (sessionData.feedback_session_id) {
                const totalScore = Object.values(sessionData.responses)
                  .filter(r => typeof r === 'number')
                  .reduce((sum: number, score: any) => sum + score, 0)
                
                await supabase
                  .from('feedback_sessions')
                  .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    total_score: totalScore || null
                  })
                  .eq('id', sessionData.feedback_session_id)
              }
              
              responseMessage = `Thank you for your valuable feedback! Your responses have been recorded. - ${org.name}`
            }
          }
        } else {
          nextStep = 'completed'
          responseMessage = 'Thank you for your feedback!'
        }
        break

      default:
        responseMessage = `Hi! We'd love your feedback on our service. 

Please reply with:
1. Yes  
2. No

Your input helps us improve. 
Thank you! – ${org.name}`
        nextStep = 'consent'
        break
    }

    // Update conversation progress
    await supabase
      .from('sms_conversation_progress')
      .update({
        current_step: nextStep,
        session_data: sessionData,
        last_message_id: messageId,
        consent_given: sessionData.consent_given || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', progress.id)

    // Send response message if needed
    if (responseMessage) {
      const sent = await sendSmsResponse(supabase, org, phoneNumber, responseMessage, senderId)
      
      if (sent) {
        // Log outbound message
        await supabase
          .from('sms_conversations')
          .insert({
            sms_session_id: progress.id,
            direction: 'outbound',
            content: responseMessage,
            status: 'sent'
          })
      }
    }

    return new Response(JSON.stringify({ success: true, step: nextStep }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Flask SMS callback error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
