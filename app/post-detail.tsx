import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-context';
import { useColors } from '@/hooks/use-colors';

const statusColors: Record<string, string> = {
  active: '#22C55E',
  inactive: '#6B7280',
  on_alert: '#F59E0B',
  closed: '#EF4444',
};

export default function PostDetailScreen() {
  const colors = useColors();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { getDeploymentPostById, guards } = useAppData();

  const post = postId ? getDeploymentPostById(postId) : null;
  const assignedGuards = post
    ? guards.filter((g) => post.assignedGuards.includes(g.id))
    : [];

  if (!post) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Deployment post not found</Text>
      </ScreenContainer>
    );
  }

  const renderGuardCard = ({ item }: { item: (typeof guards)[0] }) => (
    <View
      className="bg-background rounded-lg p-3 mb-2 flex-row justify-between items-center"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1">
        <Text className="text-sm font-bold text-foreground">{item.name}</Text>
        <Text className="text-xs text-muted">{item.idNumber}</Text>
      </View>
      <View
        className="px-2 py-1 rounded"
        style={{
          backgroundColor:
            item.status === 'on_duty'
              ? '#22C55E'
              : item.status === 'off_duty'
                ? '#6B7280'
                : '#F59E0B',
        }}
      >
        <Text className="text-xs font-semibold text-white capitalize">
          {item.status.replace('_', ' ')}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground mb-1">
                {post.name}
              </Text>
              <Text className="text-sm text-muted">{post.address}</Text>
            </View>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: statusColors[post.status] }}
            >
              <Text className="text-xs font-semibold text-white capitalize">
                {post.status.replace('_', ' ')}
              </Text>
            </View>
          </View>

          <View className="bg-background rounded-lg p-3">
            <Text className="text-xs text-muted mb-1">GUARDS ASSIGNED</Text>
            <View className="flex-row items-baseline gap-2">
              <Text className="text-3xl font-bold text-primary">
                {post.assignedGuards.length}
              </Text>
              <Text className="text-lg text-muted">/ {post.guardsRequired}</Text>
            </View>
          </View>
        </View>

        {/* Post Information */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">
            Post Information
          </Text>
          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Location</Text>
              <Text className="text-sm font-semibold text-foreground">
                {post.location}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Shift Time</Text>
              <Text className="text-sm font-semibold text-foreground">
                {post.shiftStart} - {post.shiftEnd}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Created Date</Text>
              <Text className="text-sm font-semibold text-foreground">
                {new Date(post.createdDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Client Information */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">
            Client Information
          </Text>
          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Client Name</Text>
              <Text className="text-sm font-semibold text-foreground">
                {post.clientName}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Contact</Text>
              <Text className="text-sm font-semibold text-foreground">
                {post.clientContact}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Email</Text>
              <Text className="text-sm font-semibold text-foreground">
                {post.clientEmail}
              </Text>
            </View>
          </View>
        </View>

        {/* Assigned Guards */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">
            Assigned Guards ({assignedGuards.length})
          </Text>
          {assignedGuards.length > 0 ? (
            <FlatList
              data={assignedGuards}
              renderItem={renderGuardCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              nestedScrollEnabled={true}
            />
          ) : (
            <Text className="text-sm text-muted text-center py-4">
              No guards assigned to this post
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          <TouchableOpacity
            className="py-3 rounded-lg items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-base font-bold text-background">
              Assign Guard
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
              View Incidents
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
