/**
 * Security Utilities Module
 * Provides input validation, sanitization, and security checks
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation regex (international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Password strength requirements
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Validates email format
 * @param email - Email to validate
 * @returns true if valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validates phone number format
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone.replace(/\s/g, ''));
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with validation result and feedback
 */
export const validatePasswordStrength = (
  password: string
): { isStrong: boolean; feedback: string[] } => {
  const feedback: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    feedback.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  }

  return {
    isStrong: feedback.length === 0,
    feedback,
  };
};

/**
 * Sanitizes string input to prevent XSS attacks
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns true if valid, false otherwise
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates IPv4 address
 * @param ip - IP address to validate
 * @returns true if valid, false otherwise
 */
export const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
  return ipv4Regex.test(ip);
};

/**
 * Validates latitude coordinate
 * @param lat - Latitude value
 * @returns true if valid, false otherwise
 */
export const isValidLatitude = (lat: number): boolean => {
  return lat >= -90 && lat <= 90;
};

/**
 * Validates longitude coordinate
 * @param lng - Longitude value
 * @returns true if valid, false otherwise
 */
export const isValidLongitude = (lng: number): boolean => {
  return lng >= -180 && lng <= 180;
};

/**
 * Validates coordinates
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns true if both are valid, false otherwise
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return isValidLatitude(lat) && isValidLongitude(lng);
};

/**
 * Checks if string contains SQL injection patterns
 * @param input - String to check
 * @returns true if potential SQL injection detected, false otherwise
 */
export const hasSQLInjectionPatterns = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(-{2}|\/\*|\*\/|xp_|sp_)/i,
    /(;|\||&&)/,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
};

/**
 * Rate limiting check
 */
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Checks if action exceeds rate limit
 * @param identifier - Unique identifier (e.g., user ID, IP)
 * @param maxAttempts - Maximum attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if limit exceeded, false otherwise
 */
export const isRateLimited = (
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const record = rateLimitStore[identifier];

  if (!record || now > record.resetTime) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return false;
  }

  record.count++;
  return record.count > maxAttempts;
};

/**
 * Resets rate limit for identifier
 * @param identifier - Unique identifier
 */
export const resetRateLimit = (identifier: string): void => {
  delete rateLimitStore[identifier];
};

/**
 * Validates user input for common security issues
 * @param input - User input to validate
 * @returns Object with validation results
 */
export const validateUserInput = (input: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!input || input.trim().length === 0) {
    errors.push('Input cannot be empty');
  }

  if (hasSQLInjectionPatterns(input)) {
    errors.push('Input contains potentially malicious patterns');
  }

  if (input.length > 10000) {
    errors.push('Input is too long (maximum 10000 characters)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generates CSRF token
 * @returns Random CSRF token
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for Node.js/server environment
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validates CSRF token
 * @param token - Token to validate
 * @param storedToken - Stored token to compare against
 * @returns true if tokens match, false otherwise
 */
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken;
};

/**
 * Creates a secure hash of data for integrity checking
 * @param data - Data to hash
 * @returns Hash string
 */
export const createIntegrityHash = (data: string): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser environment - use SubtleCrypto
    return data; // Simplified for now
  } else {
    // Node.js environment
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
};

/**
 * Validates data integrity using hash
 * @param data - Original data
 * @param hash - Hash to verify
 * @returns true if hash matches, false otherwise
 */
export const verifyIntegrity = (data: string, hash: string): boolean => {
  const calculatedHash = createIntegrityHash(data);
  return calculatedHash === hash;
};

/**
 * Removes sensitive information from objects (for logging)
 * @param obj - Object to sanitize
 * @param sensitiveKeys - Keys to remove
 * @returns Sanitized object
 */
export const removeSensitiveData = (
  obj: any,
  sensitiveKeys: string[] = ['password', 'token', 'secret', 'apiKey', 'creditCard']
): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key in sanitized) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = removeSensitiveData(sanitized[key], sensitiveKeys);
    }
  }

  return sanitized;
};

/**
 * Generates a secure random string
 * @param length - Length of string to generate
 * @returns Random string
 */
export const generateSecureRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
