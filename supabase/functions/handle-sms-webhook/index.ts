
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  corsHeaders,
  handleNewSession,
  handleOngoingSession,
  logSmsConversation,
} from './helpers.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const webhookSecret = url.pathname.split('/').pop()

    if (!webhookSecret) {
      console.warn("Webhook called without secret.")
      return new Response('END Invalid request. Secret missing.', { headers: { ...corsHeaders, 'Content-Type': 'text/plain' }, status: 400 })
    }

    // 1. Find organization by webhook secret
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, slug, thank_you_message, sms_settings')
      .eq('webhook_secret', webhookSecret)
      .single()

    if (orgError || !org) {
      console.error(`Webhook error: Organization not found for secret ${webhookSecret}`, orgError)
      return new Response('END Service configuration error.', { headers: { ...corsHeaders, 'Content-Type': 'text/plain' }, status: 404 })
    }

    if (!org.sms_settings?.username || !org.sms_settings?.apiKey) {
      console.error(`SMS not configured for org ${org.id}`)
      return new Response('END SMS service not configured.', { headers: { ...corsHeaders, 'Content-Type': 'text/plain' }, status: 400 })
    }

    const organizationId = org.id

    // 2. Parse incoming data from Africa's Talking
    const formData = await req.formData();
    const from = formData.get('from') as string | null;
    let text = formData.get('text') as string | null;
    const messageId = formData.get('id') as string | null;
    
    text = text === null ? '' : text.trim();

    console.log(`SMS received from ${from}: "${text}" (ID: ${messageId})`)

    if (!from) {
      console.warn("Webhook received request without a 'from' number.")
      return new Response('END Could not identify your phone number.', { headers: { ...corsHeaders, 'Content-Type': 'text/plain' }, status: 400 })
    }

    // 3. Fetch all active questions for the survey
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*, question_options(*), question_scale_config(*)')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('order_index')

    if (questionsError || !questions || questions.length === 0) {
      console.error(`No questions found for org ${organizationId}`, questionsError)
      return new Response('END No survey is currently available. Please try again later.', { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } })
    }

    // 4. Find active SMS session or create a new one
    const { data: session, error: sessionError } = await supabase
      .from('sms_sessions')
      .select('*')
      .eq('phone_number', from)
      .eq('organization_id', organizationId)
      .in('status', ['started', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (sessionError && sessionError.code !== 'PGRST116') { // pgrst116 is "No rows found"
        throw sessionError;
    }

    let response: Response;
      
    if (!session) {
      if (text.toUpperCase() === 'STOP') {
        await logSmsConversation(supabase, null, from, text, 'incoming', messageId);
        return new Response('END You have been unsubscribed.', { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } });
      }
      response = await handleNewSession(supabase, from, organizationId, questions, messageId);
    } else {
      const thankYouMessage = org.thank_you_message || 'Thank you for your feedback!';
      response = await handleOngoingSession(supabase, session, text, questions, organizationId, thankYouMessage, messageId);
    }

    // Log the incoming message
    const sessionId = session?.id || null;
    await logSmsConversation(supabase, sessionId, from, text, 'incoming', messageId);

    return response;

  } catch (error) {
    console.error('Fatal error in handle-sms-webhook:', error.message, error.stack)
    return new Response('END An unexpected error occurred. Please try again later.', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    })
  }
})
