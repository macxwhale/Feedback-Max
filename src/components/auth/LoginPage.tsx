
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/auth/AuthWrapper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { EnhancedLoadingSpinner } from "@/components/admin/dashboard/EnhancedLoadingSpinner";

const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Check if this is an invitation flow
  const isInvitation = searchParams.get('invitation') === 'true';
  const orgSlug = searchParams.get('org');
  const invitationEmail = searchParams.get('email');

  // Form states
  const [email, setEmail] = useState(invitationEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(isInvitation); // Default to sign up for invitations

  // Organization info for invitation
  const [orgInfo, setOrgInfo] = useState<{ name: string; slug: string } | null>(null);

  // Redirect authenticated users (but allow invitation processing)
  useEffect(() => {
    // Don't redirect if auth is still loading
    if (authLoading) return;
    
    // Don't redirect if this is an invitation flow - let the user complete the invitation
    if (isInvitation) return;
    
    // Only redirect authenticated users for non-invitation flows
    if (user) {
      navigate('/');
    }
  }, [user, navigate, isInvitation, authLoading]);

  // Fetch organization info for invitation
  useEffect(() => {
    if (isInvitation && orgSlug) {
      const fetchOrgInfo = async () => {
        const { data } = await supabase
          .from('organizations')
          .select('name, slug')
          .eq('slug', orgSlug)
          .single();
        
        if (data) {
          setOrgInfo(data);
        }
      };
      fetchOrgInfo();
    }
  }, [isInvitation, orgSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Sign up flow
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters long");
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth-callback${isInvitation && orgSlug ? `?org=${orgSlug}&invitation=true` : ''}`
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (isInvitation && orgSlug && data.user) {
          toast({
            title: "Account created!",
            description: `Welcome to ${orgInfo?.name || 'the organization'}! Processing your invitation...`,
          });
          
          // Wait a moment for the user to be fully created, then redirect
          setTimeout(() => {
            navigate(`/auth-callback?org=${orgSlug}&invitation=true`);
          }, 1000);
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        // Sign in flow
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });

        // Redirect based on context
        if (isInvitation && orgSlug) {
          navigate(`/auth-callback?org=${orgSlug}&invitation=true`);
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <EnhancedLoadingSpinner text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isInvitation ? (
              <>Welcome to {orgInfo?.name || 'Organization'}</>
            ) : (
              <>Welcome to Pulsify</>
            )}
          </CardTitle>
          <CardDescription>
            {isInvitation ? (
              <>You've been invited to join {orgInfo?.name}. Create your account to get started.</>
            ) : (
              <>Sign in to your account or create a new one</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!invitationEmail} // Disable if email comes from invitation
                className={invitationEmail ? "bg-gray-50" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <EnhancedLoadingSpinner />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </Button>
          </form>

          {!isInvitation && (
            <>
              <Separator className="my-6" />
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-sm"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
