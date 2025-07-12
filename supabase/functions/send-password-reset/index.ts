
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

const getBaseUrl = (req: Request): string => {
  const origin = req.headers.get('origin');
  if (origin) return origin;
  
  const referer = req.headers.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    } catch {
      // Continue to fallback
    }
  }
  
  return 'https://pulsify.co.ke';
};

serve(async (req: Request) => {
  console.log('Password reset function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Parse request body
    let body;
    try {
      const bodyText = await req.text();
      console.log('Raw request body:', bodyText);
      body = JSON.parse(bodyText);
      console.log('Parsed body:', body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid request body - must be valid JSON' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400
      });
    }

    const { email } = body;
    console.log('Processing password reset for:', email);

    // Validate input
    if (!email) {
      console.error('Missing email field');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email is required' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.error('Invalid email format:', email);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Please provide a valid email address' 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 400
      });
    }

    // Create admin client for operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers.users.find(u => u.email === email.toLowerCase().trim());

    if (!userExists) {
      console.log('User not found, but returning success for security');
      return new Response(JSON.stringify({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 200
      });
    }

    console.log('User found, sending password reset email');

    // Use admin.generateLink instead of resetPasswordForEmail for more control
    const baseUrl = getBaseUrl(req);
    const redirectUrl = `${baseUrl}/reset-password`;
    
    console.log('Using redirect URL:', redirectUrl);

    const { data: linkData, error: emailError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.toLowerCase().trim(),
      options: {
        redirectTo: redirectUrl,
      }
    });

    if (emailError) {
      console.error('Failed to generate password reset link:', emailError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send password reset email. Please try again.',
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
        status: 500
      });
    }

    console.log('Password reset link generated successfully:', linkData.properties.action_link);

    return new Response(JSON.stringify({
      success: true,
      message: 'Password reset instructions have been sent to your email.',
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200
    });

  } catch (error) {
    console.error('Error in send-password-reset:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'An unexpected error occurred while processing your request. Please try again.' 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500
    });
  }
});
