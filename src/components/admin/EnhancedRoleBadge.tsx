
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getRoleConfig } from '@/utils/roleManagement';

interface EnhancedRoleBadgeProps {
  role: string;
  showIcon?: boolean;
  className?: string;
}

export const EnhancedRoleBadge: React.FC<EnhancedRoleBadgeProps> = ({ 
  role, 
  showIcon = false, 
  className = '' 
}) => {
  const config = getRoleConfig(role);
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <IconComponent className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
};
