
/**
 * User Invitation Service Implementation
 * Implements IUserInvitationService following Domain-Driven Design principles
 */

import { supabase } from '@/integrations/supabase/client';
import {
  createError,
  createErrorResponse,
  createSuccessResponse,
  ERROR_CODES,
  handleUnknownError,
  logError,
  type ApiResponse,
  type AppError,
} from '@/utils/errorHandler';
import {
  validateObject,
  VALIDATION_RULES,
} from '@/utils/validation';
import { logger } from '@/utils/logger';
import type {
  IUserInvitationService,
  InviteUserRequest,
  InviteUserResult,
  CancelInvitationRequest,
  ResendInvitationRequest,
} from '@/domain/interfaces/IUserInvitationService';

/**
 * User Invitation Service Implementation
 * Handles the business logic for user invitations
 */
export class UserInvitationService implements IUserInvitationService {
  /**
   * Validates invitation request parameters
   */
  private validateInvitationRequest(request: InviteUserRequest) {
    // Convert to Record<string, unknown> for validation compatibility
    const requestRecord: Record<string, unknown> = {
      organizationId: request.organizationId,
      role: request.role,
      email: request.email,
      enhancedRole: request.enhancedRole,
    };

    const validation = validateObject(requestRecord, {
      organizationId: [
        VALIDATION_RULES.required('Organization ID'),
        VALIDATION_RULES.uuid('Organization ID'),
      ],
      role: [
        VALIDATION_RULES.required('Role'),
        VALIDATION_RULES.length(1, 50, 'Role'),
      ],
    });

    return validation;
  }

  /**
   * Processes Supabase function response with proper error categorization
   */
  private processSupabaseResponse(data: unknown, error: unknown): ApiResponse<InviteUserResult> {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Network-related errors
      if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
        const appError = createError(
          ERROR_CODES.SYSTEM_NETWORK_ERROR,
          'Network connection failed. Please check your internet connection.',
          'high'
        );
        logError('Network error in invitation service', { originalError: errorMessage });
        return createErrorResponse(appError);
      }
      
      // Service-related errors
      if (errorMessage.includes('FunctionsError')) {
        const message = typeof data === 'object' && data !== null && 'error' in data
          ? String(data.error)
          : 'Service temporarily unavailable. Please try again.';
        
        const appError = createError(
          ERROR_CODES.SYSTEM_DATABASE_ERROR,
          message,
          'high'
        );
        logError('Database error in invitation service', { originalError: errorMessage });
        return createErrorResponse(appError);
      }
      
      // Generic error handling
      const unknownError = handleUnknownError(error, 'Failed to process invitation');
      logError('Unknown error in invitation process');
      return createErrorResponse(unknownError);
    }

    if (!data) {
      const appError = createError(
        ERROR_CODES.SYSTEM_UNKNOWN_ERROR,
        'No response received from invitation service',
        'high'
      );
      logError('No data received from invitation service');
      return createErrorResponse(appError);
    }

    // Type-safe response processing
    if (typeof data === 'object' && data !== null && 'success' in data) {
      const response = data as InviteUserResult;
      
      if (response.success === false) {
        // Map specific business errors
        const errorCode = response.message?.includes('already exists') 
          ? ERROR_CODES.BUSINESS_USER_ALREADY_EXISTS
          : ERROR_CODES.BUSINESS_ORGANIZATION_NOT_FOUND;
        
        const appError = createError(
          errorCode,
          response.message || 'Invitation failed',
          'medium'
        );
        logError('Business logic error in invitation', { response });
        return createErrorResponse(appError);
      }

      return createSuccessResponse(response);
    }

    // Fallback for unexpected response format
    return createSuccessResponse({
      success: true,
      message: 'Invitation processed successfully',
      type: 'invitation_sent',
    } as InviteUserResult);
  }

  /**
   * Invites a user to an organization
   */
  async inviteUser(request: InviteUserRequest): Promise<ApiResponse<InviteUserResult>> {
    logger.info('UserInvitationService: Processing invitation request', {
      email: request.email,
      organizationId: request.organizationId,
      role: request.role,
    });

    // Validate input parameters
    const validation = this.validateInvitationRequest(request);
    if (!validation.isValid) {
      const firstError = validation.errors[0];
      logError('Validation failed for invitation request', { ...request });
      return createErrorResponse(firstError);
    }

    try {
      // Prepare request parameters
      const requestParams = {
        email: request.email,
        organizationId: request.organizationId,
        role: request.role,
        enhancedRole: request.enhancedRole || request.role,
      };

      const { data, error } = await supabase.functions.invoke('enhanced-invite-user', {
        body: requestParams,
      });

      logger.debug('UserInvitationService: Received response from edge function', {
        hasData: !!data,
        hasError: !!error,
      });

      return this.processSupabaseResponse(data, error);

    } catch (error: unknown) {
      const handledError = handleUnknownError(
        error,
        'Failed to send invitation. Please try again.'
      );
      logError('Exception in invitation service', { ...request });
      return createErrorResponse(handledError);
    }
  }

  /**
   * Cancels a pending invitation
   */
  async cancelInvitation(request: CancelInvitationRequest): Promise<ApiResponse<void>> {
    logger.info('UserInvitationService: Cancelling invitation', {
      invitationId: request.invitationId,
    });

    // Convert to Record<string, unknown> for validation compatibility
    const requestRecord: Record<string, unknown> = {
      invitationId: request.invitationId,
    };

    // Validate invitation ID
    const validation = validateObject(requestRecord, {
      invitationId: [
        VALIDATION_RULES.required('Invitation ID'),
        VALIDATION_RULES.uuid('Invitation ID'),
      ],
    });

    if (!validation.isValid) {
      const firstError = validation.errors[0];
      logError('Validation failed for cancel invitation', { ...request });
      return createErrorResponse(firstError);
    }

    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', request.invitationId);

      if (error) {
        const appError = createError(
          ERROR_CODES.SYSTEM_DATABASE_ERROR,
          'Failed to cancel invitation',
          'medium',
          { supabaseError: error }
        );
        logError('Database error cancelling invitation', { ...request });
        return createErrorResponse(appError);
      }

      logger.info('UserInvitationService: Invitation cancelled successfully', {
        invitationId: request.invitationId,
      });
      return createSuccessResponse(undefined);

    } catch (error: unknown) {
      const handledError = handleUnknownError(error, 'Failed to cancel invitation');
      logError('Exception cancelling invitation', { ...request });
      return createErrorResponse(handledError);
    }
  }

  /**
   * Resends a pending invitation
   */
  async resendInvitation(request: ResendInvitationRequest): Promise<ApiResponse<InviteUserResult>> {
    logger.info('UserInvitationService: Resending invitation', {
      invitationId: request.invitationId,
    });

    // Implementation placeholder - would need to fetch invitation details and resend
    const appError = createError(
      ERROR_CODES.SYSTEM_UNKNOWN_ERROR,
      'Resend invitation feature not yet implemented',
      'low'
    );
    return createErrorResponse(appError);
  }
}

/**
 * Default service instance
 */
export const userInvitationService = new UserInvitationService();
