
/**
 * Email Value Object
 * Immutable value object representing a validated email address
 */

import { validateAndSanitizeEmail } from '@/utils/validation';
import { createError, ERROR_CODES } from '@/utils/errorHandler';

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates a new Email instance with validation
   * @param value - The email string to validate
   * @throws Error if email is invalid
   */
  public static create(value: string): Email {
    const validation = validateAndSanitizeEmail(value);
    
    if (!validation.isValid) {
      const error = validation.errors[0] || createError(
        ERROR_CODES.VALIDATION_INVALID_EMAIL,
        'Invalid email format',
        'medium'
      );
      throw new Error(error.message);
    }

    return new Email(validation.sanitizedEmail!);
  }

  /**
   * Gets the email value
   */
  public get value(): string {
    return this._value;
  }

  /**
   * Checks equality with another Email
   */
  public equals(other: Email): boolean {
    return this._value === other._value;
  }

  /**
   * Returns string representation
   */
  public toString(): string {
    return this._value;
  }
}
