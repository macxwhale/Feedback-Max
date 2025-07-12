
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedLoadingSpinner } from '@/components/admin/dashboard/EnhancedLoadingSpinner';
import { AuthService } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const currentUrl = window.location.href;
      console.log('=== AUTH CALLBACK START ===');
      console.log('Current URL:', currentUrl);
      console.log('Search params:', Object.fromEntries(searchParams.entries()));
      
      try {
        setLoading(true);
        
        // Get the session from URL hash or search params
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('Session data:', sessionData);
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!sessionData.session?.user) {
          console.log('No session found, redirecting to auth');
          navigate('/auth');
          return;
        }

        const user = sessionData.session.user;
        console.log('Authenticated user:', user.email);

        const authType = searchParams.get('type');
        console.log('Auth callback type:', authType);

        // Handle regular auth flows (no more invitation processing here)
        console.log('=== PROCESSING REGULAR AUTH FLOW ===');
        
        if (authType === 'signup') {
          console.log('Processing signup confirmation');
          toast({
            title: "Welcome!",
            description: "Your account has been created successfully.",
          });
        } else {
          console.log('Processing sign-in confirmation');
        }

        // Use AuthService to determine redirect
        const redirectPath = await AuthService.handlePostAuthRedirect(user);
        console.log('Redirecting to:', redirectPath);
        navigate(redirectPath);

      } catch (error: any) {
        console.error('=== AUTH CALLBACK ERROR ===');
        console.error('Auth callback error:', error);
        
        toast({
          title: "Authentication Error",
          description: error.message || "Something went wrong during authentication",
          variant: "destructive",
        });
        
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, toast]);


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
