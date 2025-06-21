
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedLoadingSpinner } from '@/components/admin/dashboard/EnhancedLoadingSpinner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session after the auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session?.user) {
          console.log('User authenticated successfully:', data.session.user.email);
          
          // Process the invitation if user has organization metadata
          const orgId = data.session.user.user_metadata?.organization_id;
          const orgSlug = data.session.user.user_metadata?.organization_slug;
          
          if (orgId && orgSlug) {
            console.log('Processing organization invitation for:', orgSlug);
            
            // Check if user is already in organization
            const { data: orgUser } = await supabase
              .from('organization_users')
              .select('id')
              .eq('user_id', data.session.user.id)
              .eq('organization_id', orgId)
              .maybeSingle();

            if (!orgUser) {
              // Add user to organization from metadata
              const { error: orgError } = await supabase
                .from('organization_users')
                .insert({
                  user_id: data.session.user.id,
                  organization_id: orgId,
                  email: data.session.user.email,
                  role: data.session.user.user_metadata?.role || 'member',
                  enhanced_role: data.session.user.user_metadata?.enhanced_role || 'member',
                  invited_by_user_id: data.session.user.user_metadata?.invited_by_user_id,
                  accepted_at: new Date().toISOString()
                });

              if (orgError) {
                console.error('Error adding user to organization:', orgError);
              } else {
                console.log('User added to organization successfully');
                
                // Update invitation status
                await supabase
                  .from('user_invitations')
                  .update({ 
                    status: 'accepted',
                    updated_at: new Date().toISOString()
                  })
                  .eq('email', data.session.user.email)
                  .eq('organization_id', orgId);
              }
            }
            
            // Redirect to organization dashboard
            navigate(`/admin/${orgSlug}`);
            return;
          }

          // Check for organization context from existing membership
          const { data: userOrgs } = await supabase
            .from('organization_users')
            .select('organization_id, organizations(slug)')
            .eq('user_id', data.session.user.id)
            .limit(1);

          if (userOrgs && userOrgs.length > 0) {
            const orgSlug = userOrgs[0].organizations?.slug;
            if (orgSlug) {
              navigate(`/admin/${orgSlug}`);
              return;
            }
          }

          // Default redirect to admin if no specific org
          navigate('/admin');
        } else {
          // No session, redirect to auth
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <EnhancedLoadingSpinner text="Processing authentication..." />
          <p className="mt-4 text-gray-600">Please wait while we set up your account...</p>
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
