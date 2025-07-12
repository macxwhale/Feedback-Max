import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { useInvitationProcessor } from '@/hooks/useInvitationProcessor';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const passwordResetMutation = usePasswordReset();
  const { processInvitation, processing: invitationProcessing } = useInvitationProcessor();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'reset' | 'set'>('reset');
  
  // Check if this is an invitation flow
  const isInvitation = searchParams.get('invitation') === 'true';
  const orgSlug = searchParams.get('org');
  const access_token = searchParams.get('access_token');
  const refresh_token = searchParams.get('refresh_token');
  
  useEffect(() => {
    // If we have tokens, this is a password set flow (user clicked email link)
    if (access_token && refresh_token) {
      setMode('set');
      // Set the session from the URL tokens
      supabase.auth.setSession({
        access_token,
        refresh_token
      });
    } else {
      setMode('reset');
    }
  }, [access_token, refresh_token]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      await passwordResetMutation.mutateAsync({ email: email.trim() });
    } catch (error) {
      console.error('Password reset error:', error);
    }
  };

  const handlePasswordSet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Password set successfully!",
      });

      // If this is an invitation flow, process the invitation
      if (isInvitation && orgSlug) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          console.log('Processing invitation after password set');
          const result = await processInvitation(user.email, orgSlug, user.id);
          
          if (result.success) {
            // Remove user from invitations table
            await supabase
              .from('user_invitations')
              .update({ status: 'accepted' })
              .eq('email', user.email)
              .eq('organization_id', (await supabase
                .from('organizations')
                .select('id')
                .eq('slug', orgSlug)
                .single()
              ).data?.id);
          }
          return; // processInvitation handles navigation
        }
      }

      // Regular password reset flow - redirect to auth
      navigate('/auth');
      
    } catch (error: any) {
      console.error('Password set error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to set password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-gray-50 via-sunset-50 to-terracotta-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/auth')}
          className="text-warm-gray-600 hover:text-warm-gray-900 hover:bg-white/50 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-sunset-100 w-16 h-16 rounded-full flex items-center justify-center text-sunset-500 mb-4 shadow-md">
              <Activity className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-space font-extrabold text-warm-gray-900">
              {mode === 'reset' 
                ? (isInvitation ? 'Set Your Password' : 'Reset Password')
                : 'Set Your Password'
              }
            </CardTitle>
            <p className="text-warm-gray-500 font-medium">
              {mode === 'reset' 
                ? 'Enter your email to receive reset instructions'
                : 'Choose a secure password for your account'
              }
            </p>
          </CardHeader>
          <CardContent>
            {mode === 'reset' ? (
              <form onSubmit={handlePasswordReset} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="font-medium text-warm-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-400/20"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={passwordResetMutation.isPending}
                  className="w-full bg-gradient-to-r from-sunset-500 to-terracotta-500 hover:from-sunset-600 hover:to-terracotta-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {passwordResetMutation.isPending ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSet} className="space-y-5">
                <div>
                  <Label htmlFor="password" className="font-medium text-warm-gray-700">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-400/20"
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="font-medium text-warm-gray-700">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 border-warm-gray-200 focus:border-sunset-400 focus:ring-sunset-400/20"
                    placeholder="Confirm your new password"
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || invitationProcessing}
                  className="w-full bg-gradient-to-r from-sunset-500 to-terracotta-500 hover:from-sunset-600 hover:to-terracotta-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading || invitationProcessing ? "Setting Password..." : "Set Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}