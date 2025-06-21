
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedLoadingSpinner } from '@/components/admin/dashboard/EnhancedLoadingSpinner';
import { AuthService } from '@/services/authService';
import type { EnhancedRole } from '@/utils/userManagementUtils';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started');
        
        // Get the session after the auth callback
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setError(sessionError.message);
          setTimeout(() => navigate('/auth?error=' + encodeURIComponent(sessionError.message)), 2000);
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

          // Handle invitation flow for new users who need to set password
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
            
            // Handle existing user invitation
            await handleExistingUserInvitation(data, orgSlugFromUrl, userEmail, userMetadata);
            return;
          }

          // Handle email confirmation (signup) flow
          if (isEmailConfirmation) {
            console.log('Processing email confirmation');
            const redirectPath = await AuthService.handlePostAuthRedirect(data.session.user);
            navigate(redirectPath);
            return;
          }

          // Handle regular login flow
          const redirectPath = await AuthService.handlePostAuthRedirect(data.session.user);
          navigate(redirectPath);
        } else {
          // No session, redirect to auth
          console.log('No session found, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Authentication failed')), 2000);
      } finally {
        setLoading(false);
      }
    };

    const handleExistingUserInvitation = async (data: any, orgSlugFromUrl: string, userEmail: string, userMetadata: any) => {
      try {
        // Get organization details
        const { data: organization } = await supabase
          .from('organizations')
          .select('id, name, slug')
          .eq('slug', orgSlugFromUrl)
          .single();

        if (!organization) {
          console.error('Organization not found:', orgSlugFromUrl);
          setError('Organization not found');
          setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Organization not found')), 2000);
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
            setError('Failed to join organization');
            setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Failed to join organization')), 2000);
            return;
          }

          console.log('User successfully added to organization');
        } else {
          console.log('User already in organization');
        }

        // Redirect to organization dashboard
        console.log('Redirecting to organization dashboard:', orgSlugFromUrl);
        navigate(`/admin/${orgSlugFromUrl}`);
      } catch (error) {
        console.error('Error handling existing user invitation:', error);
        setError('Failed to process invitation');
        setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Failed to process invitation')), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Authentication Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting you back to login...</p>
        </div>
      </div>
    );
  }

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
