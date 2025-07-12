
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemUser } from '@/hooks/useSystemUsers';
import { Organization } from '@/services/organizationService.types';
import { EnhancedRoleSelector } from '../EnhancedRoleSelector';

interface AssignUserToOrgModalProps {
  isOpen: boolean;
  user: SystemUser | null;
  organizations: Organization[];
  onClose: () => void;
  onSubmit: (userId: string, email: string, organizationId: string, role: string) => void;
  isSubmitting: boolean;
}

export const AssignUserToOrgModal: React.FC<AssignUserToOrgModalProps> = ({
  isOpen,
  user,
  organizations,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('member');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && selectedOrgId) {
      onSubmit(user.user_id, user.email, selectedOrgId, selectedRole);
    }
  };

  const handleClose = () => {
    setSelectedOrgId('');
    setSelectedRole('member');
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign User to Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>User Email</Label>
            <div className="p-2 bg-gray-50 rounded border">
              {user.email}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name} (/{org.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <EnhancedRoleSelector
              currentUserRole="owner" // System admin can assign any role
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedOrgId}>
              {isSubmitting ? 'Assigning...' : 'Assign User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
