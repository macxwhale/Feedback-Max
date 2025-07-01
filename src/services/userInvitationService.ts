
/**
 * User Invitation Service Layer
 * Following service layer patterns from industry best practices
 * Separates business logic from UI components
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
} from '@/utils/errorHandler';
import {
  validateObject,
  validateAndSanitizeEmail,
  VALIDATION_RULES,
} from '@/utils/validation';

/**
 * Interface for user invitation service
 * Defines the contract for invitation operations
 */
export interface UserInvitationService {
  inviteUser(params: InviteUserParams): Promise<ApiResponse<InviteUserResponse>>;
  cancelInvitation(invitationId: string): Promise<ApiResponse<void>>;
  resendInvitation(invitationId: string): Promise<ApiResponse<InviteUserResponse>>;
}

/**
 * Parameters for user invitation
 */
export interface InviteUserParams extends Record<string, unknown> {
  readonly email: string;
  readonly organizationId: string;
  readonly role: string;
  readonly enhancedRole?: string;
}

/**
 * Response from invitation service
 */
export interface InviteUserResponse {
  readonly success: boolean;
  readonly message?: string;
  readonly type?: 'direct_add' | 'invitation_sent';
  readonly invitationId?: string;
}

/**
 * Implementation of user invitation service
 * Follows dependency injection principles for testability
 */
class UserInvitationServiceImpl implements UserInvitationService {
  /**
   * Validates invitation parameters according to business rules
   */
  private validateInvitationParams(params: InviteUserParams) {
    // Validate email format and sanitize
    const emailValidation = validateAndSanitizeEmail(params.email as string);
    if (!emailValidation.isValid) {
      return { isValid: false, errors: emailValidation.errors, sanitizedEmail: null };
    }

    // Validate other required fields
    const validation = validateObject(params, {
      organizationId: [
        VALIDATION_RULES.required('Organization ID'),
        VALIDATION_RULES.uuid('Organization ID'),
      ],
      role: [
        VALIDATION_RULES.required('Role'),
        VALIDATION_RULES.length(1, 50, 'Role'),
      ],
    });

    return {
      ...validation,
      sanitizedEmail: emailValidation.sanitizedEmail,
    };
  }

  /**
   * Processes Supabase function response with proper error categorization
   */
  private processSupabaseResponse(data: unknown, error: unknown): ApiResponse<InviteUserResponse> {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Network-related errors
      if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
        const appError = createError(
          ERROR_CODES.SYSTEM_NETWORK_ERROR,
          'Network connection failed. Please check your internet connection.',
          'high'
        );
        logError(appError, { originalError: errorMessage });
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
        logError(appError, { originalError: errorMessage });
        return createErrorResponse(appError);
      }
      
      // Generic error handling
      const unknownError = handleUnknownError(error, 'Failed to process invitation');
      logError(unknownError);
      return createErrorResponse(unknownError);
    }

    if (!data) {
      const appError = createError(
        ERROR_CODES.SYSTEM_UNKNOWN_ERROR,
        'No response received from invitation service',
        'high'
      );
      logError(appError);
      return createErrorResponse(appError);
    }

    // Type-safe response processing
    if (typeof data === 'object' && data !== null && 'success' in data) {
      const response = data as InviteUserResponse;
      
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
        logError(appError, { response });
        return createErrorResponse(appError);
      }

      return createSuccessResponse(response);
    }

    // Fallback for unexpected response format
    return createSuccessResponse({
      success: true,
      message: 'Invitation processed successfully',
      type: 'invitation_sent',
    } as InviteUserResponse);
  }

  /**
   * Invites a user to an organization
   */
  async inviteUser(params: InviteUserParams): Promise<ApiResponse<InviteUserResponse>> {
    console.log('UserInvitationService: Processing invitation request', {
      email: params.email,
      organizationId: params.organizationId,
      role: params.role,
    });

    // Validate input parameters
    const validation = this.validateInvitationParams(params);
    if (!validation.isValid) {
      const firstError = validation.errors[0];
      logError(firstError, { params });
      return createErrorResponse(firstError);
    }

    try {
      // Prepare sanitized request
      const sanitizedParams = {
        email: validation.sanitizedEmail!,
        organizationId: params.organizationId as string,
        role: params.role as string,
        enhancedRole: (params.enhancedRole as string) || (params.role as string),
      };

      const { data, error } = await supabase.functions.invoke('enhanced-invite-user', {
        body: sanitizedParams,
      });

      console.log('UserInvitationService: Received response from edge function', {
        hasData: !!data,
        hasError: !!error,
      });

      return this.processSupabaseResponse(data, error);

    } catch (error: unknown) {
      const handledError = handleUnknownError(
        error,
        'Failed to send invitation. Please try again.'
      );
      logError(handledError, { params });
      return createErrorResponse(handledError);
    }
  }

  /**
   * Cancels a pending invitation
   */
  async cancelInvitation(invitationId: string): Promise<ApiResponse<void>> {
    console.log('UserInvitationService: Cancelling invitation', { invitationId });

    // Validate invitation ID
    const validation = validateObject({ invitationId }, {
      invitationId: [
        VALIDATION_RULES.required('Invitation ID'),
        VALIDATION_RULES.uuid('Invitation ID'),
      ],
    });

    if (!validation.isValid) {
      const firstError = validation.errors[0];
      logError(firstError, { invitationId });
      return createErrorResponse(firstError);
    }

    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) {
        const appError = createError(
          ERROR_CODES.SYSTEM_DATABASE_ERROR,
          'Failed to cancel invitation',
          'medium',
          { supabaseError: error }
        );
        logError(appError, { invitationId });
        return createErrorResponse(appError);
      }

      console.log('UserInvitationService: Invitation cancelled successfully', { invitationId });
      return createSuccessResponse(undefined);

    } catch (error: unknown) {
      const handledError = handleUnknownError(error, 'Failed to cancel invitation');
      logError(handledError, { invitationId });
      return createErrorResponse(handledError);
    }
  }

  /**
   * Resends a pending invitation
   */
  async resendInvitation(invitationId: string): Promise<ApiResponse<InviteUserResponse>> {
    // Implementation would follow similar patterns to inviteUser
    // This is a placeholder for future implementation
    const appError = createError(
      ERROR_CODES.SYSTEM_UNKNOWN_ERROR,
      'Resend invitation feature not yet implemented',
      'low'
    );
    return createErrorResponse(appError);
  }
}

/**
 * Singleton instance of the user invitation service
 * Following dependency injection patterns for better testability
 */
export const userInvitationService: UserInvitationService = new UserInvitationServiceImpl();

/**
 * Factory function for creating service instances
 * Useful for testing with mock implementations
 */
export const createUserInvitationService = (): UserInvitationService => {
  return new UserInvitationServiceImpl();
};
