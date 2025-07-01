
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  validateAndSanitizeEmail,
  VALIDATION_RULES,
} from '@/utils/validation';

/**
 * Interface for user invitation parameters
 * Following strict typing standards for better maintainability
 */
interface InviteUserParams extends Record<string, unknown> {
  readonly email: string;
  readonly organizationId: string;
  readonly role: string;
  readonly enhancedRole?: string;
}

/**
 * Interface for invitation response
 * Consistent with our standardized API response format
 */
interface InviteUserResponse {
  readonly success: boolean;
  readonly error?: string;
  readonly message?: string;
  readonly type?: 'direct_add' | 'invitation_sent';
}

/**
 * Validates invitation parameters according to business rules
 */
const validateInvitationParams = (params: InviteUserParams): { isValid: boolean; errors: AppError[] } => {
  // Validate email separately for better error messaging
  const emailValidation = validateAndSanitizeEmail(params.email as string);
  if (!emailValidation.isValid) {
    return { isValid: false, errors: emailValidation.errors };
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

  return validation;
};

/**
 * Processes the Supabase function response with proper error handling
 */
const processInvitationResponse = (
  data: unknown,
  error: unknown
): ApiResponse<InviteUserResponse> => {
  // Handle Supabase function invoke errors (network/infrastructure issues)
  if (error) {
    console.error('Supabase function invoke error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Categorize different types of errors
    if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
      const appError = createError(
        ERROR_CODES.SYSTEM_NETWORK_ERROR,
        'Network error: Please check your internet connection and try again',
        'high'
      );
      logError(appError, { originalError: errorMessage });
      return createErrorResponse(appError);
    }
    
    if (errorMessage.includes('FunctionsError') || errorMessage.includes('non-2xx status code')) {
      const message = typeof data === 'object' && data !== null && 'error' in data
        ? String(data.error)
        : 'Service error occurred. Please try again.';
      
      const appError = createError(
        ERROR_CODES.SYSTEM_DATABASE_ERROR,
        message,
        'high'
      );
      logError(appError, { originalError: errorMessage });
      return createErrorResponse(appError);
    }
    
    const unknownError = handleUnknownError(error, 'Failed to send invitation request');
    logError(unknownError);
    return createErrorResponse(unknownError);
  }

  // Handle missing response data
  if (!data) {
    const appError = createError(
      ERROR_CODES.SYSTEM_UNKNOWN_ERROR,
      'No response received from server',
      'high'
    );
    logError(appError);
    return createErrorResponse(appError);
  }

  // Type guard to check if data has expected structure
  if (typeof data === 'object' && data !== null && 'success' in data) {
    const response = data as InviteUserResponse;
    
    // Check if the response indicates application-level failure
    if (response.success === false) {
      const appError = createError(
        ERROR_CODES.BUSINESS_USER_ALREADY_EXISTS, // This could be more specific based on response.error
        response.error || 'Failed to invite user',
        'medium'
      );
      logError(appError, { response });
      return createErrorResponse(appError);
    }

    console.log('Invitation successful:', response);
    return createSuccessResponse(response);
  }

  // Fallback for unexpected response format
  console.log('Invitation completed with unexpected response format:', data);
  return createSuccessResponse({
    success: true,
    message: 'Invitation processed successfully',
    type: 'invitation_sent',
  } as InviteUserResponse);
};

/**
 * Enhanced user invitation hook with comprehensive error handling
 * Following React Query best practices and industry standards
 */
export const useEnhancedInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: InviteUserParams): Promise<InviteUserResponse> => {
      console.log('Starting invitation process:', {
        email: params.email,
        organizationId: params.organizationId,
        role: params.role,
        enhancedRole: params.enhancedRole,
      });
      
      // Validate input parameters
      const validation = validateInvitationParams(params);
      if (!validation.isValid) {
        const firstError = validation.errors[0];
        logError(firstError, { params });
        throw new Error(firstError.message);
      }

      try {
        // Prepare sanitized parameters
        const emailValidation = validateAndSanitizeEmail(params.email as string);
        const sanitizedParams = {
          email: emailValidation.sanitizedEmail!,
          organizationId: params.organizationId as string,
          role: params.role as string,
          enhancedRole: (params.enhancedRole as string) || (params.role as string),
        };

        const { data, error } = await supabase.functions.invoke('enhanced-invite-user', {
          body: sanitizedParams,
        });

        console.log('Function response received:', { data, error });

        const result = processInvitationResponse(data, error);
        
        // Type guard to check if result is an error response
        if (!result.success) {
          throw new Error(result.error.message);
        }

        return result.data;
        
      } catch (error: unknown) {
        const handledError = handleUnknownError(
          error,
          'Failed to invite user. Please try again.'
        );
        logError(handledError, { params });
        throw new Error(handledError.message);
      }
    },

    onSuccess: (data: InviteUserResponse) => {
      // Invalidate relevant queries following React Query best practices
      const queryKeysToInvalidate = [
        { queryKey: ['organization-members'] },
        { queryKey: ['organization-invitations'] },
      ];

      queryKeysToInvalidate.forEach(({ queryKey }) => {
        queryClient.invalidateQueries({ queryKey });
      });
      
      // Provide user-friendly success feedback
      const message = data.type === 'direct_add'
        ? 'User added to organization successfully!'
        : 'Invitation sent successfully! The user will receive an email with instructions to join.';
      
      toast.success(message);
      
      console.log('Invitation completed successfully:', {
        type: data.type,
        message: data.message,
      });
    },

    onError: (error: Error) => {
      console.error('Invitation mutation failed:', error);
      
      // Log the error for monitoring
      const appError = createError(
        ERROR_CODES.BUSINESS_USER_ALREADY_EXISTS,
        error.message || 'Failed to invite user',
        'medium'
      );
      logError(appError);
      
      // Show user-friendly error message
      toast.error(error.message || 'Failed to invite user');
    },
  });
};
