
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedLoadingSpinner } from '@/components/admin/dashboard/EnhancedLoadingSpinner';
import { AuthService } from '@/services/authService';
import { useInvitationProcessor } from '@/hooks/useInvitationProcessor';
import type { Role } from '@/utils/roleManagement';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { processInvitation } = useInvitationProcessor();

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
          if (isPasswordReset && !isInvitation) {
            console.log('Processing standard password reset');
            navigate('/auth?reset=true');
            return;
          }

          // Handle invitation flow for new users (email confirmation from invitation)
          if (isInvitation && userEmail && orgSlugFromUrl && isEmailConfirmation) {
            console.log('Processing invitation signup - redirecting to password setup');
            navigate('/auth?reset=true&invitation=true&org=' + orgSlugFromUrl);
            return;
          }

          // Handle invitation flow for password reset completion
          if (isInvitation && userEmail && orgSlugFromUrl && isPasswordReset) {
            console.log('Processing invitation after password reset - adding user to organization');
            await handleInvitationFlow(data, orgSlugFromUrl, userEmail);
            return;
          }

          // Handle invitation flow for existing users (direct login)
          if (isInvitation && userEmail && orgSlugFromUrl && !isEmailConfirmation && !isPasswordReset) {
            console.log('Processing invitation for existing user login');
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
        console.log('Starting invitation processing for:', userEmail, 'to org:', orgSlugFromUrl);
        
        // Validate organization slug before querying
        if (!isValidSlug(orgSlugFromUrl)) {
          console.error('Invalid organization slug:', orgSlugFromUrl);
          setError('Invalid organization invitation');
          setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Invalid organization invitation')), 2000);
          return;
        }

        // Use the invitation processor hook to handle the invitation
        const result = await processInvitation(userEmail, orgSlugFromUrl, data.session.user.id);
        
        if (result.success) {
          console.log('Invitation processed successfully, user should be redirected to org dashboard');
          // The processInvitation hook handles the redirect, so we don't need to do anything else
        } else {
          console.error('Invitation processing failed:', result.error);
          setError('Failed to process invitation: ' + result.error);
          setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Failed to process invitation')), 2000);
        }
      } catch (error) {
        console.error('Error handling invitation flow:', error);
        setError('Failed to process invitation');
        setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Failed to process invitation')), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, processInvitation]);

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
