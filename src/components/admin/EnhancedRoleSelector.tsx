
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRoleConfig, getAvailableRoles, type Role } from '@/utils/roleManagement';

interface EnhancedRoleSelectorProps {
  currentUserRole: string;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  disabled?: boolean;
}

export const EnhancedRoleSelector: React.FC<EnhancedRoleSelectorProps> = ({
  currentUserRole,
  selectedRole,
  onRoleChange,
  disabled = false
}) => {
  const availableRoles = getAvailableRoles(currentUserRole);
  
  // Add current selected role if it exists (for editing scenarios)
  const allRoles = [...availableRoles];
  if (selectedRole && !availableRoles.includes(selectedRole as Role)) {
    allRoles.push(selectedRole as Role);
  }

  return (
    <Select value={selectedRole} onValueChange={onRoleChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {allRoles.map((role) => {
          const config = getRoleConfig(role);
          return (
            <SelectItem key={role} value={role}>
              <div className="flex items-center gap-2">
                <config.icon className="w-4 h-4" />
                <span>{config.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
