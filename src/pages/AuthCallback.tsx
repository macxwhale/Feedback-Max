
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedLoadingSpinner } from '@/components/admin/dashboard/EnhancedLoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [needsSignup, setNeedsSignup] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [orgInfo, setOrgInfo] = useState<{name: string, slug: string} | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          
          // Check if this is a new user invitation
          const welcome = searchParams.get('welcome');
          const orgName = searchParams.get('org');
          
          if (welcome === 'true' && orgName) {
            setOrgInfo({ name: decodeURIComponent(orgName), slug: window.location.pathname.split('/')[2] });
            setNeedsSignup(true);
            setLoading(false);
            return;
          }
          
          navigate('/auth?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session?.user) {
          // Process the invitation if user has organization metadata
          try {
            await supabase.functions.invoke('auth-callback-handler', {
              body: { userId: data.session.user.id }
            });
          } catch (err) {
            console.error('Callback handler error:', err);
            // Continue even if this fails
          }

          // Check for organization context
          const welcome = searchParams.get('welcome');
          const orgName = searchParams.get('org');
          const currentPath = window.location.pathname;
          
          if (welcome === 'true' && orgName && currentPath.includes('/admin/')) {
            const slug = currentPath.split('/')[2];
            navigate(`/admin/${slug}`);
            return;
          }

          // Redirect to appropriate dashboard
          const orgId = data.session.user.user_metadata?.organization_id;
          if (orgId) {
            // Get organization slug
            const { data: orgData } = await supabase
              .from('organizations')
              .select('slug')
              .eq('id', orgId)
              .single();
            
            if (orgData?.slug) {
              navigate(`/admin/${orgData.slug}`);
              return;
            }
          }

          // Default redirect
          navigate('/admin');
        } else {
          // Check if this is a new user invitation
          const welcome = searchParams.get('welcome');
          const orgName = searchParams.get('org');
          
          if (welcome === 'true' && orgName) {
            setOrgInfo({ name: decodeURIComponent(orgName), slug: window.location.pathname.split('/')[2] });
            setNeedsSignup(true);
            setLoading(false);
            return;
          }
          
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const email = searchParams.get('email') || '';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/${orgInfo?.slug}`,
          data: {
            organization_name: orgInfo?.name,
            organization_slug: orgInfo?.slug
          }
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        navigate(`/admin/${orgInfo?.slug}`);
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <EnhancedLoadingSpinner text="Processing your invitation..." />
          <p className="mt-4 text-gray-600">Please wait while we set up your account...</p>
        </div>
      </div>
    );
  }

  if (needsSignup && orgInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Complete Your Registration</CardTitle>
            <p className="text-sm text-gray-600">
              You've been invited to join <strong>{orgInfo.name}</strong>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={searchParams.get('email') || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full">
                Complete Registration & Join {orgInfo.name}
              </Button>
            </form>
          </CardContent>
        </Card>
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
