import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-context';
import { useColors } from '@/hooks/use-colors';
import { Guard } from '@/lib/types';

const statusColors: Record<string, string> = {
  on_duty: '#22C55E',
  off_duty: '#6B7280',
  on_leave: '#F59E0B',
  sick: '#EF4444',
  suspended: '#8B5CF6',
};

const statusLabels: Record<string, string> = {
  on_duty: 'On Duty',
  off_duty: 'Off Duty',
  on_leave: 'On Leave',
  sick: 'Sick',
  suspended: 'Suspended',
};

export default function GuardDetailScreen() {
  const colors = useColors();
  const { guardId } = useLocalSearchParams<{ guardId: string }>();
  const { getGuardById, getMeritScoreByGuardId, deploymentPosts, updateGuard } = useAppData();

  const guard = guardId ? getGuardById(guardId) : null;
  const meritScore = guard ? getMeritScoreByGuardId(guard.id) : null;
  const deploymentPost = guard?.currentDeploymentPostId
    ? deploymentPosts.find((p) => p.id === guard.currentDeploymentPostId)
    : null;

  if (!guard) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Guard not found</Text>
      </ScreenContainer>
    );
  }

  const handleUpdateStatus = (newStatus: string) => {
    updateGuard(guard.id, { status: newStatus as any });
    Alert.alert('Success', `Guard status updated to ${statusLabels[newStatus]}`);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View
          className="rounded-lg p-6 mb-4"
          style={{ backgroundColor: colors.surface }}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground mb-1">
                {guard.name}
              </Text>
              <Text className="text-sm text-muted">{guard.idNumber}</Text>
            </View>
            <View
              className="px-3 py-2 rounded-full"
              style={{ backgroundColor: statusColors[guard.status] }}
            >
              <Text className="text-xs font-semibold text-white">
                {statusLabels[guard.status]}
              </Text>
            </View>
          </View>

          {/* Merit Score */}
          <View className="bg-background rounded-lg p-4">
            <Text className="text-xs text-muted mb-2">MERIT SCORE</Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-4xl font-bold text-primary">
                {meritScore?.overall || guard.meritScore}
              </Text>
              <Text className="text-lg text-muted">%</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold text-foreground mb-4">
            Personal Information
          </Text>
          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Email</Text>
              <Text className="text-sm font-semibold text-foreground">
                {guard.email}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Phone</Text>
              <Text className="text-sm font-semibold text-foreground">
                {guard.phone}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Date of Hire</Text>
              <Text className="text-sm font-semibold text-foreground">
                {new Date(guard.dateOfHire).toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Last Check-in</Text>
              <Text className="text-sm font-semibold text-foreground">
                {guard.lastCheckIn
                  ? new Date(guard.lastCheckIn).toLocaleTimeString()
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Current Deployment */}
        {deploymentPost && (
          <View className="bg-surface rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold text-foreground mb-4">
              Current Deployment
            </Text>
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">
                {deploymentPost.name}
              </Text>
              <Text className="text-sm text-muted">{deploymentPost.address}</Text>
              <View className="flex-row gap-2 mt-2">
                <View
                  className="px-3 py-1 rounded"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-xs font-semibold text-background">
                    {deploymentPost.shiftStart} - {deploymentPost.shiftEnd}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Merit Score Breakdown */}
        {meritScore && (
          <View className="bg-surface rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold text-foreground mb-4">
              Score Breakdown
            </Text>
            <View className="gap-3">
              {[
                { label: 'Attendance', value: meritScore.attendance },
                { label: 'Performance', value: meritScore.performance },
                { label: 'Conduct', value: meritScore.conduct },
                { label: 'Training', value: meritScore.trainingCompletion },
              ].map((item) => (
                <View key={item.label} className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">{item.label}</Text>
                  <View className="flex-row items-center gap-2">
                    <View
                      className="h-2 rounded-full"
                      style={{
                        width: 100,
                        backgroundColor: colors.border,
                      }}
                    >
                      <View
                        className="h-2 rounded-full"
                        style={{
                          width: item.value,
                          backgroundColor: colors.primary,
                        }}
                      />
                    </View>
                    <Text className="text-sm font-semibold text-foreground w-10">
                      {item.value}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {guard.certifications.length > 0 && (
          <View className="bg-surface rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold text-foreground mb-4">
              Certifications
            </Text>
            <View className="gap-2">
              {guard.certifications.map((cert, index) => (
                <View
                  key={index}
                  className="flex-row items-center gap-2 p-2 rounded bg-background"
                >
                  <Text className="text-primary">✓</Text>
                  <Text className="text-sm text-foreground">{cert}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          <TouchableOpacity
            className="py-3 rounded-lg items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-base font-bold text-background">
              Assign to Post
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 rounded-lg items-center border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-base font-bold text-primary">
              Update Status
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 rounded-lg items-center border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-base font-bold text-primary">
              View Documents
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
