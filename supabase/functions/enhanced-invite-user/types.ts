
export interface InviteUserRequest {
  email: string;
  organizationId: string;
  role: string;
  enhancedRole?: string;
}

export interface InviteUserResponse {
  success: boolean;
  error?: string;
  message?: string;
  type?: 'direct_add' | 'invitation_sent';
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface OrganizationUser {
  enhanced_role: string;
}
