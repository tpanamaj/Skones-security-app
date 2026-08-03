import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { trpc } from '@/lib/trpc';
import { Calendar, Plus, Clock, Users, MapPin } from 'lucide-react-native';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface Shift {
  id: string;
  guardId: string;
  guardName: string;
  postId: string;
  postName: string;
  startDate: Date;
  endDate: Date;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  type: 'day' | 'night' | 'rotating';
}

interface ShiftSchedule {
  date: Date;
  shifts: Shift[];
}

const ShiftCard = ({ shift, onPress }: { shift: Shift; onPress: () => void }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: '#9ca3af',
      active: '#10b981',
      completed: '#3b82f6',
      cancelled: '#dc2626',
    };
    return colors[status] || '#gray';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      day: '#fbbf24',
      night: '#1f2937',
      rotating: '#8b5cf6',
    };
    return colors[type] || '#gray';
  };

  return (
    <TouchableOpacity style={styles.shiftCard} onPress={onPress}>
      <View style={styles.shiftHeader}>
        <View>
          <ThemedText style={styles.shiftGuardName}>{shift.guardName}</ThemedText>
          <ThemedText style={styles.shiftPost}>{shift.postName}</ThemedText>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(shift.type) }]}>
          <ThemedText style={styles.typeBadgeText}>{shift.type.toUpperCase()}</ThemedText>
        </View>
      </View>

      <View style={styles.shiftBody}>
        <View style={styles.shiftTime}>
          <Clock size={16} color="#666" />
          <ThemedText style={styles.shiftTimeText}>
            {format(new Date(shift.startDate), 'HH:mm')} - {format(new Date(shift.endDate), 'HH:mm')}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shift.status) }]}>
          <ThemedText style={styles.statusBadgeText}>{shift.status.toUpperCase()}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ShiftScheduling = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const startDate = startOfWeek(selectedWeek);
  const endDate = endOfWeek(selectedWeek);

  const { data: schedule = [], isLoading, refetch } = trpc.shifts.getSchedule.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const { data: availableGuards } = trpc.shifts.getAvailableGuards.useQuery();
  const { data: posts } = trpc.shifts.getPosts.useQuery();

  const createShiftMutation = trpc.shifts.createShift.useMutation();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCreateShift = async () => {
    Alert.alert('Create Shift', 'Select guard and post', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Create',
        onPress: async () => {
          try {
            await createShiftMutation.mutateAsync({
              guardId: availableGuards?.[0]?.id || '',
              postId: posts?.[0]?.id || '',
              startDate: new Date(),
              endDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
              type: 'day',
            });
            refetch();
          } catch (error) {
            Alert.alert('Error', 'Failed to create shift');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.scrollView}
      >
        {/* Week Navigation */}
        <View style={styles.weekNav}>
          <TouchableOpacity
            onPress={() => setSelectedWeek(new Date(selectedWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
          >
            <ThemedText style={styles.navButton}>← Previous</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.weekLabel}>
            {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
          </ThemedText>
          <TouchableOpacity
            onPress={() => setSelectedWeek(new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
          >
            <ThemedText style={styles.navButton}>Next →</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Add Shift Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleCreateShift}>
          <Plus size={20} color="#fff" />
          <ThemedText style={styles.addButtonText}>Create Shift</ThemedText>
        </TouchableOpacity>

        {/* Schedule Summary */}
        {schedule.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>Total Shifts</ThemedText>
              <ThemedText style={styles.summaryValue}>{schedule.length}</ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>Guards Assigned</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {new Set(schedule.map((s: Shift) => s.guardId)).size}
              </ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryLabel}>Posts Covered</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {new Set(schedule.map((s: Shift) => s.postId)).size}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Shifts by Day */}
        {schedule.map((daySchedule: ShiftSchedule, idx: number) => (
          <View key={idx} style={styles.daySection}>
            <ThemedText style={styles.dayTitle}>
              {format(new Date(daySchedule.date), 'EEEE, MMM dd')}
            </ThemedText>
            {daySchedule.shifts.map((shift: Shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onPress={() => {
                  // Navigate to shift details
                }}
              />
            ))}
            {daySchedule.shifts.length === 0 && (
              <ThemedText style={styles.noShiftsText}>No shifts scheduled</ThemedText>
            )}
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    paddingVertical: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  daySection: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  shiftCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  shiftGuardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  shiftPost: {
    fontSize: 12,
    color: '#666',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  shiftBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shiftTimeText: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noShiftsText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 16,
  },
});

export default ShiftScheduling;
