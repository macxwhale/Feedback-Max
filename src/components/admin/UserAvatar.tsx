import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/roleManagement';

interface UserAvatarProps {
  email: string;
  size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ email, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarFallback>{getInitials(email)}</AvatarFallback>
    </Avatar>
  );
};
