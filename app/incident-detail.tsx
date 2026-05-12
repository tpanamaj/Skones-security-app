import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-context';
import { useColors } from '@/hooks/use-colors';

const severityColors: Record<string, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#8B5CF6',
};

const statusColors: Record<string, string> = {
  reported: '#3B82F6',
  investigating: '#F59E0B',
  resolved: '#22C55E',
  closed: '#6B7280',
};

export default function IncidentDetailScreen() {
  const colors = useColors();
  const { incidentId } = useLocalSearchParams<{ incidentId: string }>();
  const { getIncidentById } = useAppData();

  const incident = incidentId ? getIncidentById(incidentId) : null;

  if (!incident) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Incident not found</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground mb-1">
                {incident.type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text className="text-sm text-muted">{incident.location}</Text>
            </View>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: severityColors[incident.severity] }}
            >
              <Text className="text-xs font-semibold text-white capitalize">
                {incident.severity}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View
              className="px-3 py-1 rounded"
              style={{ backgroundColor: statusColors[incident.status] }}
            >
              <Text className="text-xs font-semibold text-white capitalize">
                {incident.status}
              </Text>
            </View>
            <Text className="text-xs text-muted">
              {new Date(incident.dateTime).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold text-foreground mb-2">
            Description
          </Text>
          <Text className="text-sm text-foreground leading-relaxed">
            {incident.description}
          </Text>
        </View>

        {/* Incident Details */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">
            Details
          </Text>
          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Reported By</Text>
              <Text className="text-sm font-semibold text-foreground">
                {incident.reportedBy}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Date & Time</Text>
              <Text className="text-sm font-semibold text-foreground">
                {new Date(incident.dateTime).toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Guards Involved</Text>
              <Text className="text-sm font-semibold text-foreground">
                {incident.guardIds.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">
            Timeline
          </Text>
          {incident.timeline.map((update, index) => (
            <View
              key={index}
              className="pb-4 mb-4 border-l-2 pl-4"
              style={{ borderLeftColor: colors.primary }}
            >
              <View className="flex-row justify-between items-start mb-1">
                <View
                  className="px-2 py-1 rounded"
                  style={{ backgroundColor: statusColors[update.status] }}
                >
                  <Text className="text-xs font-semibold text-white capitalize">
                    {update.status}
                  </Text>
                </View>
                <Text className="text-xs text-muted">
                  {new Date(update.timestamp).toLocaleString()}
                </Text>
              </View>
              <Text className="text-xs text-muted mb-1">By: {update.updatedBy}</Text>
              <Text className="text-sm text-foreground">{update.notes}</Text>
            </View>
          ))}
        </View>

        {/* Resolution */}
        {incident.resolutionNotes && (
          <View className="bg-surface rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold text-foreground mb-2">
              Resolution
            </Text>
            <Text className="text-sm text-foreground leading-relaxed">
              {incident.resolutionNotes}
            </Text>
            {incident.resolvedDate && (
              <Text className="text-xs text-muted mt-2">
                Resolved: {new Date(incident.resolvedDate).toLocaleString()}
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          <TouchableOpacity
            className="py-3 rounded-lg items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-base font-bold text-background">
              Update Status
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-3 rounded-lg items-center border border-border"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-base font-bold text-primary">
              Add Note
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
