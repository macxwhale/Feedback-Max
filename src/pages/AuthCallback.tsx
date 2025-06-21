
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
          const isInvitation = searchParams.get('invitation') === 'true';
          
          console.log('Organization slug from URL:', orgSlugFromUrl);
          console.log('Is invitation flow:', isInvitation);

          // Process invitation if this is an invitation flow
          if (isInvitation && userEmail && orgSlugFromUrl) {
            console.log('Processing invitation for:', userEmail, 'to org:', orgSlugFromUrl);
            
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
            const userMetadata = data.session.user.user_metadata;
            const role = userMetadata?.role || 'member';
            const enhancedRole = userMetadata?.enhanced_role || role;
            const inviterEmail = userMetadata?.inviter_email;

            console.log('Invitation details from metadata:', { role, enhancedRole, inviterEmail });

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
            console.log('Redirecting to organization:', orgSlugFromUrl);
            navigate(`/admin/${orgSlugFromUrl}`);
            return;
          }

          // Handle non-invitation flows
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
