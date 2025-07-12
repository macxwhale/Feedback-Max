
// Utility to call the Supabase Edge Function for organization creation
import { supabase } from "@/integrations/supabase/client";

interface CreateOrgInput {
  email: string;
  orgName: string;
  userId: string;
}

export async function createOrganization({ email, orgName, userId }: CreateOrgInput) {
  try {
    // Get the user's session (access token)
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    // Use Supabase client's .functions.invoke to call the edge function, passing auth header
    const { data, error } = await supabase.functions.invoke("create-organization", {
      body: { email, orgName, userId },
      ...(accessToken && {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
    });

    if (error) {
      throw new Error(error.message || "Edge function invocation failed");
    }
    if (!data?.success || !data.organization) {
      throw new Error(data?.error || "Unknown edge function error");
    }

    return data.organization;
  } catch (err: any) {
    throw new Error(err.message || "Organization creation failed");
  }
}
