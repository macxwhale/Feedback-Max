
/**
 * User Invitation Application Service
 * Orchestrates user invitation use cases following Clean Architecture
 */

import { logger } from '@/utils/logger';
import type { IUserInvitationService, InviteUserRequest, InviteUserResult } from '@/domain/interfaces/IUserInvitationService';
import type { ApiResponse } from '@/utils/errorHandler';
import { Email } from '@/domain/value-objects/Email';
import { OrganizationId } from '@/domain/value-objects/OrganizationId';
import { UserInvitationService } from '@/services/userInvitationService';

/**
 * Application Service for User Invitations
 * Implements application-specific business rules and orchestration
 */
export class UserInvitationApplicationService {
  constructor(
    private readonly invitationService: IUserInvitationService = new UserInvitationService()
  ) {}

  /**
   * Invites a user with domain validation
   * @param request - The invitation request
   * @returns Promise with the invitation result
   */
  async inviteUser(request: InviteUserRequest): Promise<ApiResponse<InviteUserResult>> {
    logger.info('UserInvitationApplicationService: Processing invitation request', {
      email: request.email,
      organizationId: request.organizationId,
      role: request.role,
    });

    try {
      // Domain validation using value objects
      const email = Email.create(request.email);
      const organizationId = OrganizationId.create(request.organizationId);

      // Create sanitized request
      const sanitizedRequest: InviteUserRequest = {
        email: email.value,
        organizationId: organizationId.value,
        role: request.role,
        enhancedRole: request.enhancedRole,
      };

      // Delegate to domain service
      const result = await this.invitationService.inviteUser(sanitizedRequest);

      logger.info('UserInvitationApplicationService: Invitation processed successfully', {
        success: result.success,
      });

      return result;
    } catch (error) {
      logger.error('UserInvitationApplicationService: Invitation failed', {
        error: error instanceof Error ? error.message : String(error),
        request,
      });
      throw error;
    }
  }

  /**
   * Cancels an invitation
   * @param invitationId - The invitation ID to cancel
   * @returns Promise with the cancellation result
   */
  async cancelInvitation(invitationId: string): Promise<ApiResponse<void>> {
    logger.info('UserInvitationApplicationService: Cancelling invitation', {
      invitationId,
    });

    return this.invitationService.cancelInvitation({ invitationId });
  }

  /**
   * Resends an invitation
   * @param invitationId - The invitation ID to resend
   * @returns Promise with the resend result
   */
  async resendInvitation(invitationId: string): Promise<ApiResponse<InviteUserResult>> {
    logger.info('UserInvitationApplicationService: Resending invitation', {
      invitationId,
    });

    return this.invitationService.resendInvitation({ invitationId });
  }
}

/**
 * Factory function for creating the application service
 * Supports dependency injection for testing
 */
export const createUserInvitationApplicationService = (
  invitationService?: IUserInvitationService
): UserInvitationApplicationService => {
  return new UserInvitationApplicationService(invitationService);
};

/**
 * Default instance for application use
 */
export const userInvitationApplicationService = new UserInvitationApplicationService();
