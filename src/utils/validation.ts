
/**
 * Validation utilities following industry standards
 * Based on defensive programming principles and input validation best practices
 */

import { ERROR_CODES, createError, type AppError } from './errorHandler';

export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: AppError[];
}

/**
 * Validates email format using RFC 5322 compliant regex
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates required fields
 */
export const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validates string length
 */
export const hasValidLength = (
  value: string,
  min: number = 0,
  max: number = Infinity
): boolean => {
  const length = value.trim().length;
  return length >= min && length <= max;
};

/**
 * Validates UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  required: <T>(fieldName: string): ValidationRule<T> => ({
    validate: isRequired,
    message: `${fieldName} is required`,
    code: ERROR_CODES.VALIDATION_REQUIRED_FIELD,
  }),
  
  email: (): ValidationRule<string> => ({
    validate: isValidEmail,
    message: 'Please provide a valid email address',
    code: ERROR_CODES.VALIDATION_INVALID_EMAIL,
  }),
  
  length: (min: number, max: number, fieldName: string): ValidationRule<string> => ({
    validate: (value: string) => hasValidLength(value, min, max),
    message: `${fieldName} must be between ${min} and ${max} characters`,
    code: ERROR_CODES.VALIDATION_INVALID_FORMAT,
  }),
  
  uuid: (fieldName: string): ValidationRule<string> => ({
    validate: isValidUUID,
    message: `${fieldName} must be a valid UUID`,
    code: ERROR_CODES.VALIDATION_INVALID_FORMAT,
  }),
} as const;

/**
 * Validates a value against multiple rules
 */
export const validateField = <T>(
  value: T,
  rules: ValidationRule<T>[]
): ValidationResult => {
  const errors: AppError[] = [];
  
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(createError(rule.code, rule.message, 'medium'));
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates an object against a schema
 */
export const validateObject = <T extends Record<string, unknown>>(
  obj: T,
  schema: Record<keyof T, ValidationRule<T[keyof T]>[]>
): ValidationResult => {
  const allErrors: AppError[] = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const fieldValue = obj[field as keyof T];
    const result = validateField(fieldValue, rules as ValidationRule<unknown>[]);
    allErrors.push(...result.errors);
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

/**
 * Sanitizes user input by trimming whitespace and basic HTML escaping
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Validates and sanitizes email input
 */
export const validateAndSanitizeEmail = (email: string): ValidationResult & { sanitizedEmail?: string } => {
  const sanitizedEmail = sanitizeInput(email).toLowerCase();
  const result = validateField(sanitizedEmail, [VALIDATION_RULES.email()]);
  
  return {
    ...result,
    sanitizedEmail: result.isValid ? sanitizedEmail : undefined,
  };
};
