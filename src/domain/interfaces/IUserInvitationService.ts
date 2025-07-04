
/**
 * User Invitation Service Interface
 * Defines the contract for user invitation operations
 */

import type { ApiResponse } from '@/utils/errorHandler';

export interface InviteUserRequest {
  email: string;
  organizationId: string;
  role: string;
  enhancedRole?: string;
}

export interface InviteUserResult {
  success: boolean;
  message?: string;
  type?: 'direct_add' | 'invitation_sent';
  invitation_id?: string;
}

export interface CancelInvitationRequest {
  invitationId: string;
}

export interface ResendInvitationRequest {
  invitationId: string;
}

export interface IUserInvitationService {
  /**
   * Invite a user to an organization
   */
  inviteUser(request: InviteUserRequest): Promise<ApiResponse<InviteUserResult>>;

  /**
   * Cancel a pending invitation
   */
  cancelInvitation(request: CancelInvitationRequest): Promise<ApiResponse<void>>;

  /**
   * Resend a pending invitation
   */
  resendInvitation(request: ResendInvitationRequest): Promise<ApiResponse<InviteUserResult>>;
}
