import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useColors } from '@/hooks/use-colors';
import { UserRole } from '@/lib/types';

const roles: { id: UserRole; name: string; description: string; icon: string }[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features and guard management',
    icon: '👨‍💼',
  },
  {
    id: 'accounts',
    name: 'Accounts Officer',
    description: 'Manage payroll, payments, and financial reports',
    icon: '💰',
  },
  {
    id: 'operations',
    name: 'Operations Manager',
    description: 'Monitor deployments, track guards, and manage incidents',
    icon: '📍',
  },
  {
    id: 'guard',
    name: 'Security Guard',
    description: 'View assignments and report incidents',
    icon: '🛡️',
  },
];

export default function RoleSelectScreen() {
  const colors = useColors();
  const { setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      await setUserRole(role);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to set role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background" edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="justify-center px-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Select Your Role
          </Text>
          <Text className="text-base text-muted">
            Choose your role to access the appropriate features
          </Text>
        </View>

        {/* Role Cards */}
        <View className="gap-4 mb-6">
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => handleSelectRole(role.id)}
              disabled={isLoading}
              className="p-4 rounded-lg border-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: selectedRole === role.id ? colors.primary : colors.border,
              }}
            >
              <View className="flex-row items-start gap-4">
                <Text className="text-4xl">{role.icon}</Text>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground">
                    {role.name}
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    {role.description}
                  </Text>
                </View>
                {selectedRole === role.id && (
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-background font-bold">✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        {selectedRole && (
          <TouchableOpacity
            onPress={() => handleSelectRole(selectedRole)}
            disabled={isLoading}
            className="py-4 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-lg font-bold text-background">
              {isLoading ? 'Loading...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
