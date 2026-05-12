import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export default function LoginScreen() {
  const colors = useColors();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('john.mensah@skones.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      router.replace('/role-select');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <ScreenContainer className="bg-background" edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="justify-center px-6">
        <View className="items-center mb-12">
          {/* Logo */}
          <View
            className="w-24 h-24 rounded-full mb-6"
            style={{ backgroundColor: colors.primary }}
          >
            <View className="flex-1 items-center justify-center">
              <Text className="text-4xl font-bold text-background">SK</Text>
            </View>
          </View>

          <Text className="text-3xl font-bold text-foreground mb-2">
            Skones Security
          </Text>
          <Text className="text-base text-muted text-center">
            Management System
          </Text>
        </View>

        {/* Login Form */}
        <View className="gap-4 mb-6">
          {/* Email Input */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Email Address
            </Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              className="px-4 py-3 rounded-lg border border-border bg-surface text-foreground"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Password Input */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">
              Password
            </Text>
            <View className="flex-row items-center border border-border rounded-lg bg-surface px-4">
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry={!showPassword}
                className="flex-1 py-3 text-foreground"
                style={{ color: colors.foreground }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Text className="text-primary font-semibold">
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity className="mb-6" disabled={isLoading}>
          <Text className="text-primary text-sm font-semibold text-right">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          className={cn(
            'py-4 rounded-lg items-center justify-center',
            isLoading ? 'opacity-50' : ''
          )}
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-lg font-bold text-background">
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Demo Credentials */}
        <View className="mt-8 p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
          <Text className="text-xs font-semibold text-muted mb-2">
            DEMO CREDENTIALS
          </Text>
          <Text className="text-xs text-muted mb-1">
            Admin: john.mensah@skones.com / password
          </Text>
          <Text className="text-xs text-muted mb-1">
            Accounts: ama.owusu@skones.com / password
          </Text>
          <Text className="text-xs text-muted">
            Operations: kwame.boateng@skones.com / password
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
