
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useEnhancedInviteUser } from '@/hooks/useEnhancedUserInvitation';
import { EnhancedRoleSelector } from './EnhancedRoleSelector';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedInviteUserModalProps {
  organizationId: string;
  trigger?: React.ReactNode;
}

interface FormState {
  email: string;
  role: string;
}

const INITIAL_FORM_STATE: FormState = {
  email: '',
  role: 'member',
};

export const EnhancedInviteUserModal: React.FC<EnhancedInviteUserModalProps> = ({ 
  organizationId, 
  trigger 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [validationError, setValidationError] = useState<string>('');
  const { userRole } = useEnhancedPermissions(organizationId);
  
  const inviteUserMutation = useEnhancedInviteUser();

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
    setValidationError('');
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    const trimmedEmail = formState.email.trim();
    
    if (!trimmedEmail) {
      setValidationError('Email address is required');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    console.log('Submitting invitation:', {
      email: trimmedEmail,
      organizationId,
      role: formState.role
    });

    inviteUserMutation.mutate(
      { 
        email: trimmedEmail, 
        organizationId, 
        role: formState.role,
        enhancedRole: formState.role
      },
      {
        onSuccess: () => {
          resetForm();
          setIsOpen(false);
        },
        onError: (error) => {
          console.error('Invitation failed:', error);
          setValidationError(error.message || 'Failed to send invitation');
        }
      }
    );
  };

  const updateFormField = (field: keyof FormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    if (validationError) {
      setValidationError('');
    }
  };

  const isFormValid = formState.email.trim().length > 0 && validateEmail(formState.email.trim());

  const defaultTrigger = (
    <Button>
      <UserPlus className="w-4 h-4 mr-2" />
      Invite User
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite User to Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formState.email}
              onChange={(e) => updateFormField('email', e.target.value)}
              required
              className={validationError && validationError.includes('email') ? 'border-red-500' : ''}
            />
            <p className="text-sm text-gray-500">
              The user will receive an email invitation to join your organization and set up their account.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <EnhancedRoleSelector
              currentUserRole={userRole || 'member'}
              selectedRole={formState.role}
              onRoleChange={(value) => updateFormField('role', value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={inviteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={inviteUserMutation.isPending || !isFormValid}
            >
              {inviteUserMutation.isPending ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
