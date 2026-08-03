import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, MapPin } from 'lucide-react-native';

interface IncidentAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  location: string;
  reportedBy: string;
  reportedAt: Date;
  assignedTo?: string;
  resolvedAt?: Date;
  responseTime?: number;
}

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#f59e0b',
    low: '#10b981',
  };
  return colors[severity] || '#gray';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'resolved':
      return <CheckCircle2 size={20} color="#10b981" />;
    case 'in_progress':
      return <Clock size={20} color="#f59e0b" />;
    default:
      return <AlertCircle size={20} color="#dc2626" />;
  }
};

const IncidentCard = ({ incident, onPress }: { incident: IncidentAlert; onPress: () => void }) => {
  const severityColor = getSeverityColor(incident.severity);
  const responseTime = incident.responseTime ? `${incident.responseTime}m response` : 'Awaiting response';

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
          <ThemedText style={styles.severityText}>{incident.severity.toUpperCase()}</ThemedText>
        </View>
        {getStatusIcon(incident.status)}
      </View>
      
      <ThemedText style={styles.cardTitle}>{incident.title}</ThemedText>
      <ThemedText style={styles.cardDescription}>{incident.description}</ThemedText>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <MapPin size={14} color="#666" />
          <ThemedText style={styles.footerText}>{incident.location}</ThemedText>
        </View>
        <ThemedText style={styles.footerText}>{responseTime}</ThemedText>
      </View>
      
      <View style={styles.cardMetaData}>
        <ThemedText style={styles.metaText}>Reported {formatDistanceToNow(new Date(incident.reportedAt), { addSuffix: true })}</ThemedText>
        <ThemedText style={styles.metaText}>By: {incident.reportedBy}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const DashboardStats = ({ stats }: { stats: any }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statCard}>
      <ThemedText style={styles.statNumber}>{stats.critical}</ThemedText>
      <ThemedText style={styles.statLabel}>Critical</ThemedText>
    </View>
    <View style={styles.statCard}>
      <ThemedText style={styles.statNumber}>{stats.high}</ThemedText>
      <ThemedText style={styles.statLabel}>High</ThemedText>
    </View>
    <View style={styles.statCard}>
      <ThemedText style={styles.statNumber}>{stats.avgResponseTime}</ThemedText>
      <ThemedText style={styles.statLabel}>Avg Response (min)</ThemedText>
    </View>
    <View style={styles.statCard}>
      <ThemedText style={styles.statNumber}>{stats.resolutionRate}%</ThemedText>
      <ThemedText style={styles.statLabel}>Resolution Rate</ThemedText>
    </View>
  </View>
);

export default function IncidentDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);

  const { data: incidents = [], isLoading, refetch } = trpc.incidents.list.useQuery();
  const { data: stats } = trpc.incidents.stats.useQuery();

  const filteredIncidents = selectedSeverity
    ? incidents.filter((i: IncidentAlert) => i.severity === selectedSeverity)
    : incidents;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
        {stats && <DashboardStats stats={stats} />}

        {/* Severity Filter */}
        <View style={styles.filterContainer}>
          {['critical', 'high', 'medium', 'low'].map((severity) => (
            <TouchableOpacity
              key={severity}
              style={[
                styles.filterButton,
                selectedSeverity === severity && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedSeverity(selectedSeverity === severity ? null : severity)}
            >
              <ThemedText style={styles.filterText}>{severity}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Incidents List */}
        <FlatList
          data={filteredIncidents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <IncidentCard
              incident={item}
              onPress={() => {
                // Navigate to incident details
              }}
            />
          )}
          scrollEnabled={false}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText>No incidents to display</ThemedText>
            </ThemedView>
          }
        />
      </ScrollView>
    </ThemedView>
  );
}

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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  cardMetaData: {
    marginTop: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#999',
    marginVertical: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
});
