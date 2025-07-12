import { isValidEmail, isRequired, hasValidLength } from '../validation'

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(isValidEmail('valid.email@subdomain.example.org')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('missing@')).toBe(false)
      expect(isValidEmail('@missing-local.com')).toBe(false)
      expect(isValidEmail('spaces @example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isRequired', () => {
    it('should validate non-empty values', () => {
      expect(isRequired('text')).toBe(true)
      expect(isRequired('0')).toBe(true)
      expect(isRequired(0)).toBe(true)
      expect(isRequired(false)).toBe(true)
    })

    it('should reject empty values', () => {
      expect(isRequired('')).toBe(false)
      expect(isRequired('   ')).toBe(false)
      expect(isRequired(null)).toBe(false)
      expect(isRequired(undefined)).toBe(false)
    })
  })

  describe('hasValidLength', () => {
    it('should validate correct string lengths', () => {
      expect(hasValidLength('hello', 3, 10)).toBe(true)
      expect(hasValidLength('test', 4, 4)).toBe(true)
      expect(hasValidLength('a', 1, 5)).toBe(true)
    })

    it('should reject strings outside length range', () => {
      expect(hasValidLength('hi', 3, 10)).toBe(false)
      expect(hasValidLength('this is too long', 3, 10)).toBe(false)
      expect(hasValidLength('', 1, 5)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(hasValidLength('test', 0, 10)).toBe(true)
      expect(hasValidLength('', 0, 10)).toBe(true)
      expect(hasValidLength('test', 5, 3)).toBe(false) // min > max
    })
  })
})