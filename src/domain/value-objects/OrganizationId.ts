
/**
 * Organization ID Value Object
 * Immutable value object representing a validated organization ID
 */

import { isValidUUID } from '@/utils/validation';
import { createError, ERROR_CODES } from '@/utils/errorHandler';

export class OrganizationId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates a new OrganizationId instance with validation
   * @param value - The UUID string to validate
   * @throws Error if UUID is invalid
   */
  public static create(value: string): OrganizationId {
    if (!isValidUUID(value)) {
      const error = createError(
        ERROR_CODES.VALIDATION_INVALID_FORMAT,
        'Invalid organization ID format',
        'medium'
      );
      throw new Error(error.message);
    }

    return new OrganizationId(value);
  }

  /**
   * Gets the organization ID value
   */
  public get value(): string {
    return this._value;
  }

  /**
   * Checks equality with another OrganizationId
   */
  public equals(other: OrganizationId): boolean {
    return this._value === other._value;
  }

  /**
   * Returns string representation
   */
  public toString(): string {
    return this._value;
  }
}
