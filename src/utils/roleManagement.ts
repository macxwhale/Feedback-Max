
import { Shield, User, Settings, BarChart3, Eye, Crown } from 'lucide-react';

export type Role = 'owner' | 'admin' | 'manager' | 'analyst' | 'member' | 'viewer';

export interface RoleDefinition {
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  level: number;
  permissions: string[];
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  owner: {
    variant: 'destructive',
    icon: Crown,
    label: 'Owner',
    description: 'Full access including billing and organization management',
    level: 6,
    permissions: ['*'] // All permissions
  },
  admin: {
    variant: 'default',
    icon: Shield,
    label: 'Admin',
    description: 'Full access except billing and ownership changes',
    level: 5,
    permissions: ['manage_users', 'manage_questions', 'view_analytics', 'export_data', 'manage_integrations']
  },
  manager: {
    variant: 'secondary',
    icon: Settings,
    label: 'Manager',
    description: 'Team management and question creation',
    level: 4,
    permissions: ['manage_questions', 'view_analytics', 'export_data', 'invite_users']
  },
  analyst: {
    variant: 'outline',
    icon: BarChart3,
    label: 'Analyst',
    description: 'Analytics access and data export',
    level: 3,
    permissions: ['view_analytics', 'export_data', 'manage_questions']
  },
  member: {
    variant: 'secondary',
    icon: User,
    label: 'Member',
    description: 'Basic access to view analytics',
    level: 2,
    permissions: ['view_analytics']
  },
  viewer: {
    variant: 'outline',
    icon: Eye,
    label: 'Viewer',
    description: 'Read-only access to basic analytics',
    level: 1,
    permissions: ['view_analytics']
  }
};

export const getRoleConfig = (role: string): RoleDefinition => {
  return ROLE_DEFINITIONS[role as Role] || ROLE_DEFINITIONS.member;
};

export const canManageRole = (managerRole: string, targetRole: string): boolean => {
  const managerLevel = ROLE_DEFINITIONS[managerRole as Role]?.level || 0;
  const targetLevel = ROLE_DEFINITIONS[targetRole as Role]?.level || 0;
  return managerLevel > targetLevel;
};

export const getAvailableRoles = (userRole: string): Role[] => {
  const userLevel = ROLE_DEFINITIONS[userRole as Role]?.level || 0;
  
  return Object.entries(ROLE_DEFINITIONS)
    .filter(([, config]) => config.level < userLevel)
    .map(([role]) => role as Role);
};

export const hasPermission = (role: string, permission: string): boolean => {
  const roleConfig = ROLE_DEFINITIONS[role as Role];
  if (!roleConfig) return false;
  
  // Owner has all permissions
  if (roleConfig.permissions.includes('*')) return true;
  
  return roleConfig.permissions.includes(permission);
};

// Utility functions for formatting
export const getInitials = (email: string): string => {
  return email.split('@')[0].slice(0, 2).toUpperCase();
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const getStatusBadgeVariant = (status: string) => {
  return status === 'active' ? 'default' : 'secondary';
};

export const isExpiringSoon = (expiresAt: string): boolean => {
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilExpiry <= 24;
};
