
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvitationProcessorProps {
  userEmail: string;
  userId: string;
  orgSlug?: string;
  onInvitationProcessed: (orgSlug: string) => void;
}

export const InvitationProcessor: React.FC<InvitationProcessorProps> = ({
  userEmail,
  userId,
  orgSlug,
  onInvitationProcessed
}) => {
  useEffect(() => {
    const processInvitations = async () => {
      try {
        console.log('Processing invitations for:', userEmail);
        
        // Look for pending invitations
        const { data: pendingInvitations, error } = await supabase
          .from('user_invitations')
          .select(`
            id,
            organization_id,
            role,
            enhanced_role,
            invited_by_user_id,
            organizations!inner(slug, name)
          `)
          .eq('email', userEmail)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching invitations:', error);
          return;
        }

        if (!pendingInvitations || pendingInvitations.length === 0) {
          console.log('No pending invitations found');
          return;
        }

        // Find the right invitation to process
        let invitationToProcess = pendingInvitations[0];
        
        if (orgSlug) {
          const matchingInvitation = pendingInvitations.find(
            inv => inv.organizations.slug === orgSlug
          );
          if (matchingInvitation) {
            invitationToProcess = matchingInvitation;
          }
        }

        console.log('Processing invitation:', invitationToProcess);

        // Check if user is already in organization
        const { data: existingMembership } = await supabase
          .from('organization_users')
          .select('id')
          .eq('user_id', userId)
          .eq('organization_id', invitationToProcess.organization_id)
          .maybeSingle();

        if (!existingMembership) {
          // Add user to organization
          const { error: addError } = await supabase
            .from('organization_users')
            .insert({
              user_id: userId,
              organization_id: invitationToProcess.organization_id,
              email: userEmail,
              role: invitationToProcess.role,
              enhanced_role: invitationToProcess.enhanced_role || invitationToProcess.role,
              invited_by_user_id: invitationToProcess.invited_by_user_id,
              accepted_at: new Date().toISOString()
            });

          if (addError) {
            console.error('Error adding user to organization:', addError);
            toast.error('Failed to join organization');
            return;
          }

          console.log('User successfully added to organization');
          toast.success(`Welcome to ${invitationToProcess.organizations.name}!`);
        }

        // Mark invitation as accepted
        await supabase
          .from('user_invitations')
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString()
          })
          .eq('id', invitationToProcess.id);

        // Notify parent component
        onInvitationProcessed(invitationToProcess.organizations.slug);

      } catch (error) {
        console.error('Error processing invitations:', error);
        toast.error('Failed to process invitation');
      }
    };

    if (userEmail && userId) {
      processInvitations();
    }
  }, [userEmail, userId, orgSlug, onInvitationProcessed]);

  return null; // This component doesn't render anything
};
