import { ScrollView, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useAppData } from '@/lib/app-context';
import { useColors } from '@/hooks/use-colors';

export default function DashboardScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const { guards, deploymentPosts, incidents, payrollEntries } = useAppData();

  const onDutyCount = guards.filter((g) => g.status === 'on_duty').length;
  const pendingIncidents = incidents.filter((i) => i.status === 'reported').length;
  const pendingPayroll = payrollEntries.filter((p) => p.status === 'pending').length;

  const handleLogout = async () => {
    await logout();
  };

  const StatCard = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: string | number;
    color: string;
  }) => (
    <View
      className="flex-1 rounded-lg p-4 items-center justify-center mr-2"
      style={{ backgroundColor: colors.surface }}
    >
      <Text
        className="text-3xl font-bold mb-1"
        style={{ color }}
      >
        {value}
      </Text>
      <Text className="text-xs text-muted text-center">{label}</Text>
    </View>
  );

  const QuickActionButton = ({
    label,
    onPress,
  }: {
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 py-3 rounded-lg items-center justify-center mr-2 mb-2"
      style={{ backgroundColor: colors.primary }}
    >
      <Text className="text-sm font-bold text-background">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              Welcome, {user?.name.split(' ')[0]}!
            </Text>
            <Text className="text-sm text-muted capitalize">
              {user?.role} • {new Date().toLocaleDateString()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="px-4 py-2 rounded-lg border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs font-bold text-primary">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View className="flex-row mb-6">
          <StatCard label="Total Guards" value={guards.length} color={colors.primary} />
          <StatCard label="On Duty" value={onDutyCount} color="#22C55E" />
          <StatCard label="Incidents" value={pendingIncidents} color="#EF4444" />
          <StatCard label="Pending Payroll" value={pendingPayroll} color="#F59E0B" />
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-bold text-foreground mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap mb-6">
          <QuickActionButton
            label="View Guards"
            onPress={() => router.navigate('/(tabs)/guards')}
          />
          <QuickActionButton
            label="Deployments"
            onPress={() => router.navigate('/(tabs)/deployments')}
          />
          <QuickActionButton
            label="Payroll"
            onPress={() => router.navigate('/(tabs)/reports')}
          />
          <QuickActionButton
            label="Incidents"
            onPress={() => router.navigate('/(tabs)/more')}
          />
        </View>

        {/* Recent Activity */}
        <Text className="text-lg font-bold text-foreground mb-3">Recent Activity</Text>
        <View className="bg-surface rounded-lg p-4">
          {incidents.slice(0, 3).map((incident) => (
            <View
              key={incident.id}
              className="flex-row justify-between items-start pb-3 mb-3 border-b border-border"
              style={{ borderBottomColor: colors.border }}
            >
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {incident.type.replace('_', ' ').toUpperCase()}
                </Text>
                <Text className="text-xs text-muted mt-1">
                  {incident.location}
                </Text>
              </View>
              <View
                className="px-2 py-1 rounded"
                style={{
                  backgroundColor:
                    incident.severity === 'critical'
                      ? '#EF4444'
                      : incident.severity === 'high'
                        ? '#F59E0B'
                        : '#22C55E',
                }}
              >
                <Text className="text-xs font-bold text-white capitalize">
                  {incident.severity}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Deployment Overview */}
        <Text className="text-lg font-bold text-foreground mb-3 mt-6">
          Active Deployments
        </Text>
        <View className="bg-surface rounded-lg p-4">
          {deploymentPosts
            .filter((p) => p.status === 'active')
            .slice(0, 3)
            .map((post) => (
              <View
                key={post.id}
                className="flex-row justify-between items-start pb-3 mb-3 border-b border-border"
                style={{ borderBottomColor: colors.border }}
              >
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {post.name}
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    {post.assignedGuards.length}/{post.guardsRequired} guards
                  </Text>
                </View>
                <View
                  className="px-2 py-1 rounded"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-xs font-bold text-background">
                    Active
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
