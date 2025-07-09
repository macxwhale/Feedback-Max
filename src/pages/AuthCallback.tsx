import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedLoadingSpinner } from '@/components/admin/dashboard/EnhancedLoadingSpinner';
import { AuthService } from '@/services/authService';
import type { Role } from '@/utils/roleManagement';

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
          const authType = searchParams.get('type');
          const isEmailConfirmation = authType === 'signup';
          const isPasswordReset = authType === 'recovery';
          
          // Handle invitation flow parameters
          const orgSlugFromUrl = searchParams.get('org');
          const isInvitation = searchParams.get('invitation') === 'true';
          
          console.log('Auth callback - User:', userEmail);
          console.log('Auth callback - Type:', authType);
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

          // Handle invitation flow for new users (email confirmation from invitation)
          if (isInvitation && userEmail && orgSlugFromUrl && isEmailConfirmation) {
            console.log('Processing invitation signup for:', userEmail, 'to org:', orgSlugFromUrl);
            // For new users who signed up via invitation, redirect to password reset to set their password
            navigate('/auth?reset=true&invitation=true&org=' + orgSlugFromUrl);
            return;
          }

          // Handle invitation flow for existing users
          if (isInvitation && userEmail && orgSlugFromUrl && !isEmailConfirmation) {
            console.log('Processing invitation for existing user:', userEmail, 'to org:', orgSlugFromUrl);
            await handleInvitationFlow(data, orgSlugFromUrl, userEmail);
            return;
          }

          // Handle email confirmation (signup) flow or regular login
          console.log('Processing standard auth flow');
          
          // Add delay to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const redirectPath = await AuthService.handlePostAuthRedirect(data.session.user);
          console.log('Redirecting to:', redirectPath);
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

    const handleInvitationFlow = async (data: any, orgSlugFromUrl: string, userEmail: string) => {
      try {
        // Validate organization slug before querying
        if (!isValidSlug(orgSlugFromUrl)) {
          console.error('Invalid organization slug:', orgSlugFromUrl);
          setError('Invalid organization invitation');
          setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Invalid organization invitation')), 2000);
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
          setError('Organization not found');
          setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Organization not found')), 2000);
          return;
        }

        // Get invitation details from user metadata
        const userMetadata = data.session.user.user_metadata;
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
              enhanced_role: enhancedRole as Role,
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

        // Mark invitation as accepted
        const { error: updateError } = await supabase
          .from('user_invitations')
          .update({ 
            status: 'accepted',
            updated_at: new Date().toISOString()
          })
          .eq('email', userEmail.toLowerCase().trim())
          .eq('organization_id', organization.id);

        if (updateError) {
          console.warn('Could not update invitation status:', updateError);
        }

        // Redirect to organization dashboard
        console.log('Redirecting to organization dashboard:', orgSlugFromUrl);
        navigate(`/admin/${orgSlugFromUrl}`);
      } catch (error) {
        console.error('Error handling invitation flow:', error);
        setError('Failed to process invitation');
        setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Failed to process invitation')), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  const isValidSlug = (slug: string): boolean => {
    // Check if slug looks like a valid organization slug
    // Reject known system paths and invalid patterns
    const invalidSlugs = ['auth-callback', 'auth', 'admin', 'api', 'callback', 'login', 'signup'];
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    
    return (
      slug &&
      slug.length >= 2 &&
      slug.length <= 50 &&
      !invalidSlugs.includes(slug) &&
      slugPattern.test(slug)
    );
  };

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
