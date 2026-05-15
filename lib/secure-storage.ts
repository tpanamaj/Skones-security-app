/**
 * Secure Storage Module
 * Provides encrypted storage for sensitive data using AsyncStorage + encryption
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { encryptData, decryptData } from './encryption';

/**
 * Storage keys for different data types
 */
export const STORAGE_KEYS = {
  USER_SESSION: '@skones_user_session',
  AUTH_TOKEN: '@skones_auth_token',
  GUARD_DATA: '@skones_guard_data',
  PAYROLL_DATA: '@skones_payroll_data',
  LOCATION_DATA: '@skones_location_data',
  INCIDENT_DATA: '@skones_incident_data',
  APP_SETTINGS: '@skones_app_settings',
  ENCRYPTION_KEY: '@skones_encryption_key',
} as const;

/**
 * Stores encrypted data in AsyncStorage
 * @param key - Storage key
 * @param data - Data to store
 */
export const storeEncryptedData = async (key: string, data: any): Promise<void> => {
  try {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = encryptData(stringData);
    await AsyncStorage.setItem(key, encrypted);
  } catch (error) {
    console.error(`Error storing encrypted data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieves and decrypts data from AsyncStorage
 * @param key - Storage key
 * @returns Decrypted data
 */
export const getEncryptedData = async (key: string): Promise<any> => {
  try {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) {
      return null;
    }
    const decrypted = decryptData(encrypted);
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error(`Error retrieving encrypted data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Stores highly sensitive data in Secure Store (platform-specific keychain/keystore)
 * @param key - Storage key
 * @param value - Value to store
 */
export const storeSecureData = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error storing secure data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieves data from Secure Store
 * @param key - Storage key
 * @returns Stored value
 */
export const getSecureData = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error retrieving secure data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Stores guard data with encryption
 * @param guardData - Guard information to store
 */
export const storeGuardData = async (guardData: any): Promise<void> => {
  await storeEncryptedData(STORAGE_KEYS.GUARD_DATA, guardData);
};

/**
 * Retrieves encrypted guard data
 * @returns Guard data
 */
export const getGuardData = async (): Promise<any> => {
  return getEncryptedData(STORAGE_KEYS.GUARD_DATA);
};

/**
 * Stores payroll data with encryption
 * @param payrollData - Payroll information to store
 */
export const storePayrollData = async (payrollData: any): Promise<void> => {
  await storeEncryptedData(STORAGE_KEYS.PAYROLL_DATA, payrollData);
};

/**
 * Retrieves encrypted payroll data
 * @returns Payroll data
 */
export const getPayrollData = async (): Promise<any> => {
  return getEncryptedData(STORAGE_KEYS.PAYROLL_DATA);
};

/**
 * Stores location data with encryption
 * @param locationData - Location information to store
 */
export const storeLocationData = async (locationData: any): Promise<void> => {
  await storeEncryptedData(STORAGE_KEYS.LOCATION_DATA, locationData);
};

/**
 * Retrieves encrypted location data
 * @returns Location data
 */
export const getLocationData = async (): Promise<any> => {
  return getEncryptedData(STORAGE_KEYS.LOCATION_DATA);
};

/**
 * Stores user session with encryption
 * @param sessionData - User session data
 */
export const storeUserSession = async (sessionData: any): Promise<void> => {
  await storeEncryptedData(STORAGE_KEYS.USER_SESSION, sessionData);
};

/**
 * Retrieves encrypted user session
 * @returns User session data
 */
export const getUserSession = async (): Promise<any> => {
  return getEncryptedData(STORAGE_KEYS.USER_SESSION);
};

/**
 * Stores authentication token in Secure Store
 * @param token - Auth token
 */
export const storeAuthToken = async (token: string): Promise<void> => {
  await storeSecureData(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Retrieves authentication token from Secure Store
 * @returns Auth token
 */
export const getAuthToken = async (): Promise<string | null> => {
  return getSecureData(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Clears all encrypted data from storage
 */
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    // Also clear from SecureStore
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN).catch(() => {});
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ENCRYPTION_KEY).catch(() => {});
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

/**
 * Clears specific data from storage
 * @param key - Storage key to clear
 */
export const clearData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Gets all stored data (for debugging - should not be used in production)
 * @returns All stored data
 */
export const getAllData = async (): Promise<Record<string, any>> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const data: Record<string, any> = {};
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        data[key] = value;
      } catch (e) {
        data[key] = 'ERROR_READING';
      }
    }
    return data;
  } catch (error) {
    console.error('Error getting all data:', error);
    throw error;
  }
};
