
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedLoadingSpinner } from '@/components/admin/dashboard/EnhancedLoadingSpinner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session after the auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session?.user) {
          console.log('User authenticated successfully:', data.session.user.email);
          
          const userEmail = data.session.user.email;
          const orgSlugFromUrl = searchParams.get('org');
          
          console.log('Organization slug from URL:', orgSlugFromUrl);
          console.log('User metadata:', data.session.user.user_metadata);

          // Process invitation acceptance - check for pending invitations for this user
          if (userEmail) {
            console.log('Looking for pending invitations for:', userEmail);
            
            // Look for pending invitations for this user
            const { data: pendingInvitations, error: invitationError } = await supabase
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
              .order('created_at', { ascending: false });

            if (invitationError) {
              console.error('Error fetching invitations:', invitationError);
            } else if (pendingInvitations && pendingInvitations.length > 0) {
              console.log('Found pending invitations:', pendingInvitations.length);
              
              // Process the most recent invitation or one matching the org slug
              let invitationToProcess = pendingInvitations[0];
              
              if (orgSlugFromUrl) {
                const matchingInvitation = pendingInvitations.find(
                  inv => inv.organizations.slug === orgSlugFromUrl
                );
                if (matchingInvitation) {
                  invitationToProcess = matchingInvitation;
                }
              }

              console.log('Processing invitation:', invitationToProcess);

              // Check if user is already in this organization
              const { data: existingOrgUser } = await supabase
                .from('organization_users')
                .select('id')
                .eq('user_id', data.session.user.id)
                .eq('organization_id', invitationToProcess.organization_id)
                .maybeSingle();

              if (!existingOrgUser) {
                // Add user to organization
                const { error: orgError } = await supabase
                  .from('organization_users')
                  .insert({
                    user_id: data.session.user.id,
                    organization_id: invitationToProcess.organization_id,
                    email: userEmail,
                    role: invitationToProcess.role,
                    enhanced_role: invitationToProcess.enhanced_role || invitationToProcess.role,
                    invited_by_user_id: invitationToProcess.invited_by_user_id,
                    accepted_at: new Date().toISOString()
                  });

                if (orgError) {
                  console.error('Error adding user to organization:', orgError);
                } else {
                  console.log('User added to organization successfully');
                  
                  // Update invitation status to accepted
                  await supabase
                    .from('user_invitations')
                    .update({ 
                      status: 'accepted',
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', invitationToProcess.id);
                  
                  console.log('Invitation marked as accepted');
                }
              } else {
                console.log('User already in organization, marking invitation as accepted');
                
                // Still mark invitation as accepted even if user was already in org
                await supabase
                  .from('user_invitations')
                  .update({ 
                    status: 'accepted',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', invitationToProcess.id);
              }
              
              // Redirect to organization dashboard
              const orgSlug = invitationToProcess.organizations.slug;
              console.log('Redirecting to organization:', orgSlug);
              navigate(`/admin/${orgSlug}`);
              return;
            }
          }

          // Fallback: Check for organization context from existing membership or metadata
          let targetOrgSlug = orgSlugFromUrl;
          
          if (!targetOrgSlug) {
            // Try to get from user metadata (legacy flow)
            targetOrgSlug = data.session.user.user_metadata?.organization_slug;
          }
          
          if (!targetOrgSlug) {
            // Check for existing organization membership
            const { data: userOrgs } = await supabase
              .from('organization_users')
              .select('organization_id, organizations(slug)')
              .eq('user_id', data.session.user.id)
              .limit(1);

            if (userOrgs && userOrgs.length > 0) {
              targetOrgSlug = userOrgs[0].organizations?.slug;
            }
          }

          if (targetOrgSlug) {
            console.log('Redirecting to organization dashboard:', targetOrgSlug);
            navigate(`/admin/${targetOrgSlug}`);
          } else {
            console.log('No organization context found, redirecting to general admin');
            navigate('/admin');
          }
        } else {
          // No session, redirect to auth
          console.log('No session found, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        navigate('/auth?error=' + encodeURIComponent('Authentication failed'));
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <EnhancedLoadingSpinner text="Processing invitation..." />
          <p className="mt-4 text-gray-600">Setting up your account access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <EnhancedLoadingSpinner text="Redirecting..." />
      </div>
    </div>
  );
};

export default AuthCallback;
