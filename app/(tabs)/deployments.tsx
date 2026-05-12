import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useState, useMemo } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-context';
import { useColors } from '@/hooks/use-colors';
import { DeploymentPost, PostStatus } from '@/lib/types';

const statusColors: Record<PostStatus, string> = {
  active: '#22C55E',
  inactive: '#6B7280',
  on_alert: '#F59E0B',
  closed: '#EF4444',
};

const statusLabels: Record<PostStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_alert: 'On Alert',
  closed: 'Closed',
};

export default function DeploymentsScreen() {
  const colors = useColors();
  const { deploymentPosts } = useAppData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PostStatus | 'all'>('all');

  const filteredPosts = useMemo(() => {
    return deploymentPosts.filter((post) => {
      const matchesSearch =
        post.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [deploymentPosts, searchQuery, selectedStatus]);

  const renderPostCard = ({ item: post }: { item: DeploymentPost }) => (
    <TouchableOpacity
      className="bg-surface rounded-lg p-4 mb-3 border border-border"
      style={{ borderColor: colors.border }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">{post.name}</Text>
          <Text className="text-sm text-muted">{post.location}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: statusColors[post.status] }}
        >
          <Text className="text-xs font-semibold text-white">
            {statusLabels[post.status]}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-3">
        <View>
          <Text className="text-xs text-muted mb-1">Guards Assigned</Text>
          <Text className="text-lg font-bold text-primary">
            {post.assignedGuards.length}/{post.guardsRequired}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted mb-1">Shift</Text>
          <Text className="text-sm font-semibold text-foreground">
            {post.shiftStart} - {post.shiftEnd}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground mb-4">
          Deployment Posts
        </Text>

        {/* Search Bar */}
        <TextInput
          placeholder="Search posts..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="px-4 py-3 rounded-lg border border-border bg-surface text-foreground mb-3"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
            color: colors.foreground,
          }}
        />

        {/* Status Filter */}
        <FlatList
          horizontal
          data={[
            { label: 'All', value: 'all' as const },
            { label: 'Active', value: 'active' as const },
            { label: 'Inactive', value: 'inactive' as const },
            { label: 'On Alert', value: 'on_alert' as const },
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedStatus(item.value)}
              className="px-4 py-2 rounded-full mr-2"
              style={{
                backgroundColor:
                  selectedStatus === item.value ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{
                  color:
                    selectedStatus === item.value ? colors.background : colors.foreground,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.value}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Posts List */}
      {filteredPosts.length > 0 ? (
        <FlatList
          data={filteredPosts}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted">No deployment posts found</Text>
        </View>
      )}
    </ScreenContainer>
  );
}
