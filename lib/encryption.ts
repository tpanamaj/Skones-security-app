/**
 * Encryption Module for Skones Security App
 * Provides AES-256 encryption for sensitive data like guard information,
 * payroll data, and location information
 */

import CryptoJS from 'crypto-js';

/**
 * Encryption key - should be loaded from environment variables
 * In production, this should be a strong, randomly generated key
 */
const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_KEY || process.env.REACT_APP_ENCRYPTION_KEY;
  if (!key) {
    console.warn(
      'ENCRYPTION_KEY not set. Using default key for development only. Set ENCRYPTION_KEY in production!'
    );
    return 'skones-security-default-dev-key-change-in-production';
  }
  return key;
};

/**
 * Encrypts sensitive data using AES-256
 * @param data - The data to encrypt (string or object)
 * @returns Encrypted string
 */
export const encryptData = (data: string | object): string => {
  try {
    const key = getEncryptionKey();
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(stringData, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts AES-256 encrypted data
 * @param encryptedData - The encrypted string
 * @returns Decrypted string
 */
export const decryptData = (encryptedData: string): string => {
  try {
    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error('Decryption failed - invalid key or corrupted data');
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Encrypts and returns an object with encrypted fields
 * @param obj - Object to encrypt
 * @param fieldsToEncrypt - Array of field names to encrypt
 * @returns Object with specified fields encrypted
 */
export const encryptObjectFields = <T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T => {
  const encrypted = { ...obj };
  fieldsToEncrypt.forEach((field) => {
    if (field in encrypted && encrypted[field] !== undefined) {
      encrypted[field] = encryptData(String(encrypted[field])) as any;
    }
  });
  return encrypted;
};

/**
 * Decrypts specified fields in an object
 * @param obj - Object with encrypted fields
 * @param fieldsToDecrypt - Array of field names to decrypt
 * @returns Object with specified fields decrypted
 */
export const decryptObjectFields = <T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T => {
  const decrypted = { ...obj };
  fieldsToDecrypt.forEach((field) => {
    if (field in decrypted && decrypted[field]) {
      try {
        decrypted[field] = JSON.parse(decryptData(String(decrypted[field]))) as any;
      } catch {
        // If it's not JSON, return as string
        decrypted[field] = decryptData(String(decrypted[field])) as any;
      }
    }
  });
  return decrypted;
};

/**
 * Hashes sensitive data like passwords using SHA-256
 * For production, use bcrypt instead
 * @param data - Data to hash
 * @returns Hashed string
 */
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Generates a random encryption key for new deployments
 * @returns Random 256-bit key in hex format
 */
export const generateEncryptionKey = (): string => {
  const randomBytes = CryptoJS.lib.WordArray.random(32); // 256 bits
  return randomBytes.toString();
};

/**
 * Encrypts guard location data
 * @param latitude - Guard latitude
 * @param longitude - Guard longitude
 * @returns Encrypted location string
 */
export const encryptLocation = (latitude: number, longitude: number): string => {
  const locationData = JSON.stringify({ lat: latitude, lng: longitude });
  return encryptData(locationData);
};

/**
 * Decrypts guard location data
 * @param encryptedLocation - Encrypted location string
 * @returns Object with latitude and longitude
 */
export const decryptLocation = (
  encryptedLocation: string
): { lat: number; lng: number } => {
  const decrypted = decryptData(encryptedLocation);
  return JSON.parse(decrypted);
};

/**
 * Encrypts payroll sensitive information
 * @param guardId - Guard ID
 * @param amount - Payroll amount
 * @param bankDetails - Bank account details
 * @returns Encrypted payroll data
 */
export const encryptPayrollData = (
  guardId: string,
  amount: number,
  bankDetails: string
): string => {
  const payrollData = JSON.stringify({
    guardId,
    amount,
    bankDetails,
    timestamp: new Date().toISOString(),
  });
  return encryptData(payrollData);
};

/**
 * Decrypts payroll data
 * @param encryptedPayroll - Encrypted payroll string
 * @returns Decrypted payroll object
 */
export const decryptPayrollData = (
  encryptedPayroll: string
): { guardId: string; amount: number; bankDetails: string; timestamp: string } => {
  const decrypted = decryptData(encryptedPayroll);
  return JSON.parse(decrypted);
};

/**
 * Encrypts contact information
 * @param email - Email address
 * @param phone - Phone number
 * @returns Encrypted contact data
 */
export const encryptContactInfo = (email: string, phone: string): string => {
  const contactData = JSON.stringify({ email, phone });
  return encryptData(contactData);
};

/**
 * Decrypts contact information
 * @param encryptedContact - Encrypted contact string
 * @returns Decrypted contact object
 */
export const decryptContactInfo = (
  encryptedContact: string
): { email: string; phone: string } => {
  const decrypted = decryptData(encryptedContact);
  return JSON.parse(decrypted);
};
