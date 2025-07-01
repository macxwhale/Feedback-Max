
/**
 * User Invitation Service Interface
 * Defines the contract for user invitation operations following DDD principles
 */

import type { ApiResponse } from '@/utils/errorHandler';

export interface InviteUserRequest {
  readonly email: string;
  readonly organizationId: string;
  readonly role: string;
  readonly enhancedRole?: string;
}

export interface InviteUserResult {
  readonly success: boolean;
  readonly message?: string;
  readonly type?: 'direct_add' | 'invitation_sent';
  readonly invitationId?: string;
}

export interface CancelInvitationRequest {
  readonly invitationId: string;
}

export interface ResendInvitationRequest {
  readonly invitationId: string;
}

/**
 * User Invitation Service Contract
 * Following interface segregation principle
 */
export interface IUserInvitationService {
  /**
   * Invites a user to an organization
   * @param request - The invitation request
   * @returns Promise with the invitation result
   */
  inviteUser(request: InviteUserRequest): Promise<ApiResponse<InviteUserResult>>;

  /**
   * Cancels a pending invitation
   * @param request - The cancellation request
   * @returns Promise with the cancellation result
   */
  cancelInvitation(request: CancelInvitationRequest): Promise<ApiResponse<void>>;

  /**
   * Resends a pending invitation
   * @param request - The resend request
   * @returns Promise with the resend result
   */
  resendInvitation(request: ResendInvitationRequest): Promise<ApiResponse<InviteUserResult>>;
}
