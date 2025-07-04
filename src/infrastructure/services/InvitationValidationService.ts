
/**
 * Invitation Validation Service
 * Centralized validation logic for invitation operations
 */

import { validateObject, VALIDATION_RULES } from '@/utils/validation';
import { createError, ERROR_CODES, type AppError } from '@/utils/errorHandler';
import type { InviteUserRequest, CancelInvitationRequest } from '@/domain/interfaces/IUserInvitationService';

/**
 * Service for validating invitation-related operations
 */
export class InvitationValidationService {
  
  /**
   * Validate invitation request parameters
   */
  validateInvitationRequest(request: InviteUserRequest) {
    const requestRecord: Record<string, unknown> = {
      organizationId: request.organizationId,
      role: request.role,
      email: request.email,
      enhancedRole: request.enhancedRole,
    };

    return validateObject(requestRecord, {
      organizationId: [
        VALIDATION_RULES.required('Organization ID'),
        VALIDATION_RULES.uuid('Organization ID'),
      ],
      role: [
        VALIDATION_RULES.required('Role'),
        VALIDATION_RULES.length(1, 50, 'Role'),
      ],
      email: [
        VALIDATION_RULES.required('Email'),
        VALIDATION_RULES.email(),
      ],
    });
  }

  /**
   * Validate cancellation request
   */
  validateCancellationRequest(request: CancelInvitationRequest) {
    const requestRecord: Record<string, unknown> = {
      invitationId: request.invitationId,
    };

    return validateObject(requestRecord, {
      invitationId: [
        VALIDATION_RULES.required('Invitation ID'),
        VALIDATION_RULES.uuid('Invitation ID'),
      ],
    });
  }

  /**
   * Validate batch request
   */
  validateBatchRequest(requests: InviteUserRequest[]) {
    if (!Array.isArray(requests) || requests.length === 0) {
      return {
        isValid: false,
        errors: [
          createError(
            ERROR_CODES.VALIDATION_ERROR,
            'Batch requests must be a non-empty array',
            'medium'
          )
        ]
      };
    }

    const MAX_BATCH_SIZE = 50;
    if (requests.length > MAX_BATCH_SIZE) {
      return {
        isValid: false,
        errors: [
          createError(
            ERROR_CODES.VALIDATION_ERROR,
            `Batch size cannot exceed ${MAX_BATCH_SIZE} requests`,
            'medium'
          )
        ]
      };
    }

    // Validate each request in the batch
    const errors: AppError[] = [];
    requests.forEach((request, index) => {
      const validation = this.validateInvitationRequest(request);
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          errors.push({
            ...error,
            context: { ...error.context, batchIndex: index }
          });
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
