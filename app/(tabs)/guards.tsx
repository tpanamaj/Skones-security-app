import { View, Text, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-context';
import { useColors } from '@/hooks/use-colors';
import { Guard, GuardStatus } from '@/lib/types';

const statusColors: Record<GuardStatus, string> = {
  on_duty: '#22C55E',
  off_duty: '#6B7280',
  on_leave: '#F59E0B',
  sick: '#EF4444',
  suspended: '#8B5CF6',
};

const statusLabels: Record<GuardStatus, string> = {
  on_duty: 'On Duty',
  off_duty: 'Off Duty',
  on_leave: 'On Leave',
  sick: 'Sick',
  suspended: 'Suspended',
};

export default function GuardsScreen() {
  const colors = useColors();
  const { guards, getMeritScoreByGuardId } = useAppData();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<GuardStatus | 'all'>('all');

  const filteredGuards = useMemo(() => {
    return guards.filter((guard) => {
      const matchesSearch =
        guard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guard.idNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || guard.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [guards, searchQuery, selectedStatus]);

  const handleGuardPress = (guard: Guard) => {
    router.navigate({
      pathname: '/guard-detail',
      params: { guardId: guard.id },
    } as any);
  };

  const renderGuardCard = ({ item: guard }: { item: Guard }) => {
    const meritScore = getMeritScoreByGuardId(guard.id);

    return (
      <TouchableOpacity
        onPress={() => handleGuardPress(guard)}
        className="bg-surface rounded-lg p-4 mb-3 border border-border"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">{guard.name}</Text>
            <Text className="text-sm text-muted">{guard.idNumber}</Text>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: statusColors[guard.status] }}
          >
            <Text className="text-xs font-semibold text-white">
              {statusLabels[guard.status]}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-muted mb-1">Merit Score</Text>
            <Text className="text-lg font-bold text-primary">
              {meritScore?.overall || guard.meritScore}%
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted mb-1">Phone</Text>
            <Text className="text-sm font-semibold text-foreground">
              {guard.phone.slice(-4)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground mb-4">Security Guards</Text>

        {/* Search Bar */}
        <TextInput
          placeholder="Search by name or ID..."
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
            { label: 'On Duty', value: 'on_duty' as const },
            { label: 'Off Duty', value: 'off_duty' as const },
            { label: 'On Leave', value: 'on_leave' as const },
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

      {/* Guards List */}
      {filteredGuards.length > 0 ? (
        <FlatList
          data={filteredGuards}
          renderItem={renderGuardCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted">No guards found</Text>
        </View>
      )}
    </ScreenContainer>
  );
}
