
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useInvitationProcessor() {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const processInvitation = async (email: string, orgSlug: string, userId: string) => {
    setProcessing(true);
    
    try {
      console.log('Processing invitation for:', email, 'to org:', orgSlug, 'userId:', userId);
      
      // Get organization details
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('slug', orgSlug)
        .single();

      if (orgError || !organization) {
        console.error('Organization not found:', orgSlug, orgError);
        throw new Error('Organization not found');
      }

      // Check if user is already in organization
      const { data: existingMembership } = await supabase
        .from('organization_users')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (existingMembership) {
        console.log('User already in organization, redirecting...');
        navigate(`/admin/${orgSlug}`);
        return { success: true, message: 'Already a member' };
      }

      // Get invitation details to determine role
      const { data: invitation } = await supabase
        .from('user_invitations')
        .select('role, enhanced_role')
        .eq('email', email.toLowerCase().trim())
        .eq('organization_id', organization.id)
        .eq('status', 'pending')
        .single();

      const role = invitation?.role || 'member';
      const enhancedRole = invitation?.enhanced_role || 'member';

      // Add user to organization
      const { error: addError } = await supabase
        .from('organization_users')
        .insert({
          user_id: userId,
          organization_id: organization.id,
          email: email,
          role: role,
          enhanced_role: enhancedRole as "owner" | "admin" | "manager" | "analyst" | "member" | "viewer",
          status: 'active',
          accepted_at: new Date().toISOString()
        });

      if (addError) {
        console.error('Error adding user to organization:', addError);
        throw new Error('Failed to join organization');
      }

      // Mark invitation as accepted
      await supabase
        .from('user_invitations')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase().trim())
        .eq('organization_id', organization.id);

      console.log('User successfully added to organization');
      
      toast({
        title: "Welcome!",
        description: `You've successfully joined ${organization.name}`,
      });

      // Add a delay to ensure database consistency before redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to organization dashboard
      console.log('Redirecting to organization dashboard:', orgSlug);
      navigate(`/admin/${orgSlug}`);
      
      return { success: true, message: 'Successfully joined organization' };

    } catch (error) {
      console.error('Error processing invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process invitation';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setProcessing(false);
    }
  };

  return {
    processInvitation,
    processing
  };
}
