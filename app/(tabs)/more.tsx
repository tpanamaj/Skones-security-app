import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/lib/auth-context';
import { router } from 'expo-router';

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  onPress: () => void;
}

export default function MoreScreen() {
  const colors = useColors();
  const { logout } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Incidents',
      icon: '⚠️',
      description: 'View and report incidents',
      onPress: () => {},
    },
    {
      id: '2',
      name: 'Geo-Tracking',
      icon: '📍',
      description: 'Track guard locations in real-time',
      onPress: () => {},
    },
    {
      id: '3',
      name: 'Communication',
      icon: '📡',
      description: 'Send messages and broadcasts',
      onPress: () => {},
    },
    {
      id: '4',
      name: 'Company Info',
      icon: '🏢',
      description: 'About Skones Security',
      onPress: () => {},
    },
    {
      id: '5',
      name: 'Board of Directors',
      icon: '👥',
      description: 'Meet our leadership team',
      onPress: () => {},
    },
    {
      id: '6',
      name: 'Settings',
      icon: '⚙️',
      description: 'App settings and preferences',
      onPress: () => {},
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      onPress={item.onPress}
      className="bg-surface rounded-lg p-4 mb-3 border border-border flex-row items-center gap-4"
      style={{ borderColor: colors.border }}
    >
      <Text className="text-4xl">{item.icon}</Text>
      <View className="flex-1">
        <Text className="text-base font-bold text-foreground">{item.name}</Text>
        <Text className="text-xs text-muted mt-1">{item.description}</Text>
      </View>
      <Text className="text-primary text-xl">→</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-foreground mb-4">
          More Options
        </Text>

        {/* Menu Items */}
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="py-4 rounded-lg items-center justify-center mt-6 border border-error"
          style={{ borderColor: colors.error }}
        >
          <Text className="text-base font-bold text-error">
            Logout
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-xs text-muted">
            Skones Security Management App
          </Text>
          <Text className="text-xs text-muted">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
