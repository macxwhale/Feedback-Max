
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { AuthService } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check if this is a password reset link from email
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    if (accessToken && refreshToken && type === 'recovery') {
      setIsResetMode(true);
      // Set the session with the tokens from the URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error } = await AuthService.resetPassword(formData.email);
      
      if (error) {
        setError(error.message || 'Failed to send reset email');
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error } = await AuthService.updatePassword(formData.newPassword);
      
      if (error) {
        setError(error.message || 'Failed to update password');
        return;
      }

      setSuccess(true);
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (err: any) {
      console.error('Password update error:', err);
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              {isResetMode ? 'Password Updated' : 'Reset Email Sent'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isResetMode ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Your password has been updated successfully.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to login page...
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            {isResetMode ? 'Set New Password' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {isResetMode 
              ? 'Enter your new password below'
              : 'Enter your email address and we\'ll send you a reset link'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isResetMode ? handlePasswordSubmit : handleEmailSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isResetMode ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter your new password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your new password"
                    required
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading 
                ? (isResetMode ? 'Updating Password...' : 'Sending Email...')
                : (isResetMode ? 'Update Password' : 'Send Reset Email')
              }
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/auth')}
              className="p-0"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
