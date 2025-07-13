import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthWrapper';
import { useOrganization } from '@/context/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AccessRequestData {
  requestType: 'role_upgrade' | 'permission' | 'admin_access';
  requestedRole?: string;
  requestedPermission?: string;
  reason?: string;
}

export const useAccessRequest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();

  const submitAccessRequest = async (data: AccessRequestData) => {
    if (!user || !organization) {
      toast({
        title: "Error",
        description: "User or organization context not available",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Create a notification for organization admins
      const { error } = await supabase
        .from('notifications')
        .insert({
          organization_id: organization.id,
          type: 'info',
          title: 'Access Request',
          message: `${user.email} has requested ${data.requestType === 'role_upgrade' ? 'a role upgrade' : 'additional permissions'}`,
          metadata: {
            user_id: user.id,
            user_email: user.email,
            request_type: data.requestType,
            requested_role: data.requestedRole,
            requested_permission: data.requestedPermission,
            reason: data.reason,
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Error submitting access request:', error);
        toast({
          title: "Error",
          description: "Failed to submit access request. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Request Submitted",
        description: "Your access request has been sent to the organization administrators.",
        variant: "default"
      });
      
      return true;
    } catch (error) {
      console.error('Unexpected error submitting access request:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitAccessRequest,
    isSubmitting
  };
};
