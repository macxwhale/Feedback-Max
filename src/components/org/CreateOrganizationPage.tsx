
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthWrapper';

export const CreateOrganizationPage: React.FC = () => {
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUserRoles } = useAuth();

  useEffect(() => {
    const createOrganization = async () => {
      if (!user) {
        setError('You must be logged in to create an organization');
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        console.log('Creating organization for user:', user.email);
        
        // Use email to generate a default org name if not already set
        const defaultOrgName = user.email
          ? `${user.email.split('@')[0][0].toUpperCase()}${user.email.split('@')[0].slice(1)}'s Organization`
          : "My Organization";
        setOrgName(defaultOrgName);

        // Generate a slug
        let baseSlug = defaultOrgName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
          .substring(0, 50);
        let slug = baseSlug;
        let counter = 1;
        
        // Ensure slug is unique
        let { data } = await supabase
          .from('organizations')
          .select('slug')
          .eq('slug', slug)
          .single();
        
        while (data) {
          slug = `${baseSlug}-${counter}`;
          ({ data } = await supabase
            .from('organizations')
            .select('slug')
            .eq('slug', slug)
            .single());
          counter++;
          if (counter > 100) throw new Error('Unable to generate unique slug');
        }

        console.log('Creating organization with slug:', slug);

        // Create organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: defaultOrgName,
            slug,
            created_by_user_id: user.id,
            is_active: true,
            billing_email: user.email,
            plan_type: "starter",
          })
          .select()
          .single();
        
        if (orgError) throw orgError;

        console.log('Organization created:', orgData.id);

        // Add user as organization admin
        const { error: orgUserError } = await supabase
          .from('organization_users')
          .insert({
            user_id: user.id,
            organization_id: orgData.id,
            email: user.email!,
            role: 'admin',
            status: 'active',
            accepted_at: new Date().toISOString()
          });

        if (orgUserError) throw orgUserError;

        console.log('User added to organization as admin');

        setCreated(true);
        toast({
          title: "Organization Created!",
          description: `Welcome to ${defaultOrgName}. Redirecting to your dashboard...`,
        });

        // Refresh user roles to ensure they're up to date
        await refreshUserRoles();
        
        // Wait a bit longer to ensure database consistency before redirecting
        setTimeout(() => {
          console.log('Redirecting to organization dashboard:', slug);
          navigate(`/admin/${slug}`);
        }, 2000);

      } catch (err: any) {
        console.error('Error creating organization:', err);
        setError(err.message || 'Failed to create organization');
      } finally {
        setLoading(false);
      }
    };

    createOrganization();
    // Only run once after verification
    // eslint-disable-next-line
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <Activity className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {created ? "You're all set!" : "Creating Your Organization"}
            </CardTitle>
            <p className="text-gray-600">
              {created
                ? `Welcome to your dashboard.`
                : "Please wait while we set up your organization..."}
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!created && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="ghost"
                  disabled
                  className="pointer-events-none select-none"
                >
                  {loading ? "Creating organization..." : "Preparing..."}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
