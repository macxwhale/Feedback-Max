
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedLoadingSpinner } from '@/components/admin/dashboard/EnhancedLoadingSpinner';
import type { EnhancedRole } from '@/utils/userManagementUtils';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started');
        
        // Get the session after the auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session?.user) {
          const userEmail = data.session.user.email;
          const orgSlugFromUrl = searchParams.get('org');
          const isInvitation = searchParams.get('invitation') === 'true';
          const isEmailConfirmation = searchParams.get('type') === 'signup';
          const isPasswordReset = searchParams.get('type') === 'recovery';
          
          console.log('Auth callback - User:', userEmail);
          console.log('Auth callback - Org slug:', orgSlugFromUrl);
          console.log('Auth callback - Is invitation:', isInvitation);
          console.log('Auth callback - Is email confirmation:', isEmailConfirmation);
          console.log('Auth callback - Is password reset:', isPasswordReset);

          // Handle password reset flow
          if (isPasswordReset) {
            console.log('Processing password reset');
            navigate('/auth?reset=true');
            return;
          }

          // Handle email confirmation (signup) flow
          if (isEmailConfirmation) {
            console.log('Processing email confirmation');
            
            // Check if user has any organization memberships
            const { data: userOrgs } = await supabase
              .from('organization_users')
              .select('organization_id, organizations(slug)')
              .eq('user_id', data.session.user.id);

            if (userOrgs && userOrgs.length > 0) {
              const orgSlug = userOrgs[0].organizations?.slug;
              console.log('User has existing org membership, redirecting to:', orgSlug);
              navigate(`/admin/${orgSlug}`);
            } else {
              console.log('No org membership found, redirecting to create organization');
              navigate('/create-organization');
            }
            return;
          }

          // Handle invitation flow
          if (isInvitation && userEmail && orgSlugFromUrl) {
            console.log('Processing invitation for:', userEmail, 'to org:', orgSlugFromUrl);
            
            // Check if this is a new user who needs to set a password
            const userMetadata = data.session.user.user_metadata;
            const isNewUser = userMetadata?.invitation_type === 'organization_invite';
            
            if (isNewUser) {
              // Redirect to password setup with organization context
              console.log('New user invitation - redirecting to password setup');
              navigate(`/auth?setup-password=true&org=${orgSlugFromUrl}&email=${encodeURIComponent(userEmail)}`);
              return;
            }
            
            // Get organization details
            const { data: organization } = await supabase
              .from('organizations')
              .select('id, name, slug')
              .eq('slug', orgSlugFromUrl)
              .single();

            if (!organization) {
              console.error('Organization not found:', orgSlugFromUrl);
              navigate('/auth?error=' + encodeURIComponent('Organization not found'));
              return;
            }

            // Get invitation details from user metadata
            const role = userMetadata?.role || 'member';
            const enhancedRole = userMetadata?.enhanced_role || role;

            console.log('Invitation details from metadata:', { role, enhancedRole });

            // Check if user is already in organization
            const { data: existingMembership } = await supabase
              .from('organization_users')
              .select('id')
              .eq('user_id', data.session.user.id)
              .eq('organization_id', organization.id)
              .maybeSingle();

            if (!existingMembership) {
              // Add user to organization
              const { error: addError } = await supabase
                .from('organization_users')
                .insert({
                  user_id: data.session.user.id,
                  organization_id: organization.id,
                  email: userEmail,
                  role: role,
                  enhanced_role: enhancedRole as EnhancedRole,
                  status: 'active',
                  accepted_at: new Date().toISOString()
                });

              if (addError) {
                console.error('Error adding user to organization:', addError);
                navigate('/auth?error=' + encodeURIComponent('Failed to join organization'));
                return;
              }

              console.log('User successfully added to organization');
            } else {
              console.log('User already in organization');
            }

            // Redirect to organization dashboard
            console.log('Redirecting to organization dashboard:', orgSlugFromUrl);
            navigate(`/admin/${orgSlugFromUrl}`);
            return;
          }

          // Handle regular login flow
          let targetOrgSlug = orgSlugFromUrl;
          
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
            console.log('No organization context found, checking admin status');
            
            // Check if user is system admin
            const { data: isAdmin } = await supabase.rpc("get_current_user_admin_status");
            if (isAdmin) {
              navigate("/admin");
            } else {
              navigate('/create-organization');
            }
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
          <EnhancedLoadingSpinner text="Processing authentication..." />
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
