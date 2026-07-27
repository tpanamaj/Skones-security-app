import React, { useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Fingerprint, Lock } from 'lucide-react-native';

class BiometricAuthService {
  private static instance: BiometricAuthService;
  private isBiometricAvailable = false;
  private supportedTypes: LocalAuthentication.AuthenticationType[] = [];

  private constructor() {}

  static getInstance(): BiometricAuthService {
    if (!BiometricAuthService.instance) {
      BiometricAuthService.instance = new BiometricAuthService();
    }
    return BiometricAuthService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      this.isBiometricAvailable = compatible;

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        this.supportedTypes = types;
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      this.isBiometricAvailable = false;
    }
  }

  async isBiometricEnabled(userId: string): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(`biometric_enabled_${userId}`);
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  }

  async enableBiometric(userId: string): Promise<boolean> {
    if (!this.isBiometricAvailable) {
      return false;
    }

    try {
      const authenticated = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Enable biometric authentication for faster login',
      });

      if (authenticated.success) {
        await SecureStore.setItemAsync(`biometric_enabled_${userId}`, 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return false;
    }
  }

  async disableBiometric(userId: string): Promise<void> {
    await SecureStore.deleteItemAsync(`biometric_enabled_${userId}`);
  }

  async authenticate(): Promise<boolean> {
    if (!this.isBiometricAvailable) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Authenticate with your biometric',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  isBiometricAvailableOnDevice(): boolean {
    return this.isBiometricAvailable;
  }

  getSupportedTypes(): LocalAuthentication.AuthenticationType[] {
    return this.supportedTypes;
  }
}

export const useBiometricAuth = () => {
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const bioService = BiometricAuthService.getInstance();

  React.useEffect(() => {
    const initialize = async () => {
      await bioService.initialize();
      setBiometricAvailable(bioService.isBiometricAvailableOnDevice());
    };
    initialize();
  }, []);

  const authenticate = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await bioService.authenticate();
      return result;
    } finally {
      setLoading(false);
    }
  };

  const enableBiometric = async (userId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await bioService.enableBiometric(userId);
      if (result) {
        setBiometricEnabled(true);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const disableBiometric = async (userId: string): Promise<void> => {
    setLoading(true);
    try {
      await bioService.disableBiometric(userId);
      setBiometricEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    authenticate,
    enableBiometric,
    disableBiometric,
    biometricAvailable,
    biometricEnabled,
    loading,
  };
};

const BiometricAuthScreen = ({ userId, onSuccess }: { userId: string; onSuccess: () => void }) => {
  const { authenticate, enableBiometric, biometricAvailable, loading } = useBiometricAuth();

  const handleBiometricAuth = async () => {
    const success = await authenticate();
    if (success) {
      onSuccess();
    } else {
      Alert.alert('Authentication Failed', 'Please try again');
    }
  };

  const handleEnableBiometric = async () => {
    const success = await enableBiometric(userId);
    if (success) {
      Alert.alert('Success', 'Biometric authentication enabled');
    } else {
      Alert.alert('Failed', 'Could not enable biometric authentication');
    }
  };

  if (!biometricAvailable) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>Biometric authentication is not available on this device</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Fingerprint size={64} color="#3b82f6" style={styles.icon} />
        <ThemedText style={styles.title}>Biometric Authentication</ThemedText>
        <ThemedText style={styles.subtitle}>Use your fingerprint or face to authenticate</ThemedText>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleBiometricAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Authenticate</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleEnableBiometric}
          disabled={loading}
        >
          <Lock size={20} color="#3b82f6" />
          <ThemedText style={styles.secondaryButtonText}>Enable Biometric Login</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#999',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});

export default BiometricAuthScreen;
