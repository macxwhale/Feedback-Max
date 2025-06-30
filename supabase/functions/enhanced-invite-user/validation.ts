
import { InviteUserRequest } from './types.ts';

export const validateRequestBody = (body: any): { isValid: boolean; error?: string; data?: InviteUserRequest } => {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  const { email, organizationId, role, enhancedRole } = body;

  if (!email || !organizationId || !role) {
    return { 
      isValid: false, 
      error: 'Missing required fields: email, organizationId, and role are required' 
    };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { 
      isValid: false, 
      error: 'Please provide a valid email address' 
    };
  }

  return {
    isValid: true,
    data: {
      email: email.toLowerCase().trim(),
      organizationId,
      role,
      enhancedRole: enhancedRole || role
    }
  };
};
