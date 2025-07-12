import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InvitationDetails {
  id: string;
  email: string;
  organization_id: string;
  role: string;
  enhanced_role: string;
  organizations: {
    id: string;
    name: string;
    slug: string;
  };
}

const InvitationAccept: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase.rpc('validate_invitation_token', {
        p_token: token
      });

      if (error || !data || data.length === 0 || !data[0].is_valid) {
        setError(data?.[0]?.error_message || 'Invalid or expired invitation');
        return;
      }

      const validationData = data[0];
      setInvitation({
        id: validationData.invitation_id,
        email: validationData.email,
        organization_id: validationData.organization_id,
        role: validationData.role,
        enhanced_role: validationData.enhanced_role,
        organizations: {
          id: validationData.organization_id,
          name: validationData.organization_name,
          slug: validationData.organization_slug
        }
      });
    } catch (err) {
      console.error('Error validating invitation:', err);
      setError('Failed to validate invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation || !token) return;

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      const { data, error } = await supabase.functions.invoke('process-invitation', {
        body: {
          token,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        setError(data.error || 'Failed to process invitation');
        return;
      }

      setSuccess(true);
      
      // Redirect to auth page after processing
      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (err: any) {
      console.error('Error processing invitation:', err);
      setError(err.message || 'Failed to process invitation. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Welcome to {invitation?.organizations.name}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your account has been created successfully. You are now a member of {invitation?.organizations.name}.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to sign in page...
            </p>
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
            <Building2 className="w-5 h-5" />
            Join {invitation?.organizations.name}
          </CardTitle>
          <CardDescription>
            You've been invited to join {invitation?.organizations.name} as a {invitation?.enhanced_role || invitation?.role}.
            Set up your password to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={invitation?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Your last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a secure password"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={processing}
            >
              {processing ? 'Setting up your account...' : 'Accept Invitation & Join'}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Organization Details</h4>
            <p className="text-sm text-blue-700">
              <strong>Organization:</strong> {invitation?.organizations.name}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Role:</strong> {invitation?.enhanced_role || invitation?.role}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationAccept;
