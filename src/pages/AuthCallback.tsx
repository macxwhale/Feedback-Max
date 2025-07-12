
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedLoadingSpinner } from '@/components/admin/dashboard/EnhancedLoadingSpinner';
import { AuthService } from '@/services/authService';
import { useInvitationProcessor } from '@/hooks/useInvitationProcessor';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { processInvitation } = useInvitationProcessor();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== AUTH CALLBACK STARTED ===');
        console.log('URL search params:', Object.fromEntries(searchParams.entries()));
        
        // Get the session after the auth callback
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth callback session error:', sessionError);
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
          
          console.log('=== AUTH CALLBACK PROCESSING ===');
          console.log('Auth callback details:', {
            userEmail,
            authType,
            orgSlugFromUrl,
            isInvitation,
            isEmailConfirmation,
            isPasswordReset
          });

          // CRITICAL: Handle invitation flow FIRST before any other processing
          if (isInvitation && userEmail && orgSlugFromUrl) {
            console.log('=== INVITATION FLOW DETECTED ===');
            console.log('Processing invitation for:', userEmail, 'to org:', orgSlugFromUrl);
            
            // Validate organization slug before processing
            if (!isValidSlug(orgSlugFromUrl)) {
              console.error('Invalid organization slug:', orgSlugFromUrl);
              setError('Invalid organization invitation');
              setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Invalid organization invitation')), 2000);
              return;
            }

            // Process the invitation
            const result = await processInvitation(userEmail, orgSlugFromUrl, data.session.user.id);
            
            if (result.success) {
              console.log('=== INVITATION PROCESSED SUCCESSFULLY ===');
              // The processInvitation function handles the redirect
              return;
            } else {
              console.error('=== INVITATION PROCESSING FAILED ===');
              console.error('Error:', result.error);
              setError('Failed to process invitation: ' + result.error);
              setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Failed to process invitation')), 2000);
              return;
            }
          }

          // Handle password reset flow (not invitation related)
          if (isPasswordReset && !isInvitation) {
            console.log('Processing standard password reset');
            navigate('/auth?reset=true');
            return;
          }

          // Handle standard email confirmation or login
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
        console.error('=== AUTH CALLBACK ERROR ===');
        console.error('Callback processing error:', error);
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/auth?error=' + encodeURIComponent('Authentication failed')), 2000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, processInvitation]);

  const isValidSlug = (slug: string): boolean => {
    // Check if slug looks like a valid organization slug
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
