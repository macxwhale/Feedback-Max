
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { v4 as uuidv4 } from "https://deno.land/std@0.190.0/uuid/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
// Supabase client for edge functions
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    // Extract user's access token from Authorization header, if present
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.replace("Bearer ", "");
      supabase.auth.setAuth(accessToken);
    }

    const body = await req.json();
    let { email, orgName, userId } = body;

    if (!email || !userId) {
      return new Response(JSON.stringify({ error: "Email and userId required" }), {
        status: 400, headers: corsHeaders
      });
    }
    // Generate orgName if not provided
    const safeName = orgName || `${email.split("@")[0]}'s Organization`;
    // slugify or UUID fallback
    let slug = orgName
      ? orgName.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "")
      : "org-" + uuidv4.generate();

    if (!slug) slug = "org-" + uuidv4.generate();

    // Create the org
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: safeName,
        slug,
        plan_type: "starter",
        is_active: true,
        created_by_user_id: userId,
        billing_email: email,
      })
      .select()
      .single();

    if (orgError) {
      // Helpful logging for RLS/permission errors
      const message = orgError.message.includes("row-level security")
        ? "[RLS] Permission denied: Make sure you are authenticated and RLS policies are set correctly."
        : orgError.message;
      return new Response(JSON.stringify({ error: message, sql: "insert organizations" }), {
        status: 500,
        headers: corsHeaders
      });
    }
    // Assign org admin role
    const { error: orgUserError } = await supabase
      .from("organization_users")
      .insert({
        user_id: userId,
        organization_id: org.id,
        email,
        role: "admin"
      });

    if (orgUserError) {
      // Helpful logging for RLS/permission errors
      const message = orgUserError.message.includes("row-level security")
        ? "[RLS] Permission denied: Make sure you are authenticated and RLS policies are set correctly."
        : orgUserError.message;
      return new Response(JSON.stringify({ error: message, sql: "insert organization_users" }), {
        status: 500,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({ success: true, organization: org }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || err.toString() }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});
