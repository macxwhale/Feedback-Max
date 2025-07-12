
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
      console.log('=== INVITATION PROCESSING START ===');
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

      console.log('Found organization:', organization);

      // Check if user is already in organization
      const { data: existingMembership } = await supabase
        .from('organization_users')
        .select('id, role, status')
        .eq('user_id', userId)
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (existingMembership) {
        console.log('User already in organization:', existingMembership);
        
        toast({
          title: "Welcome back!",
          description: `You're already a member of ${organization.name}`,
        });
        
        navigate(`/admin/${orgSlug}`);
        return { success: true, message: 'Already a member' };
      }

      // Get invitation details to determine role
      const { data: invitation, error: invitationError } = await supabase
        .from('user_invitations')
        .select('id, role, enhanced_role, status')
        .eq('email', email.toLowerCase().trim())
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('Found invitation:', invitation, 'Error:', invitationError);

      const role = invitation?.role || 'member';
      const enhancedRole = invitation?.enhanced_role || 'member';

      console.log('Adding user to organization with role:', role, 'enhanced_role:', enhancedRole);

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
        throw new Error('Failed to join organization: ' + addError.message);
      }

      console.log('Successfully added user to organization');

      // Mark invitation as accepted if it exists
      if (invitation) {
        const { error: updateError } = await supabase
          .from('user_invitations')
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString()
          })
          .eq('id', invitation.id);

        if (updateError) {
          console.warn('Could not update invitation status:', updateError);
        } else {
          console.log('Marked invitation as accepted');
        }
      }

      console.log('=== INVITATION PROCESSING SUCCESS ===');
      
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
      console.error('=== INVITATION PROCESSING ERROR ===');
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
