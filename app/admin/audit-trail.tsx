import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { Shield, Eye, Lock, User } from 'lucide-react-native';

interface AuditLog {
  id: string;
  action: string;
  module: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details: string;
  status: 'success' | 'failure';
  ipAddress?: string;
}

const AuditLogItem = ({ log }: { log: AuditLog }) => {
  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('remove')) return '#dc2626';
    if (action.includes('create') || action.includes('add')) return '#10b981';
    if (action.includes('update') || action.includes('modify')) return '#f59e0b';
    return '#3b82f6';
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' ? (
      <Shield size={16} color="#10b981" />
    ) : (
      <Shield size={16} color="#dc2626" />
    );
  };

  return (
    <View style={styles.auditItem}>
      <View style={[styles.actionIndicator, { backgroundColor: getActionColor(log.action) }]} />
      <View style={styles.auditContent}>
        <View style={styles.auditHeader}>
          <ThemedText style={styles.auditAction}>{log.action}</ThemedText>
          {getStatusIcon(log.status)}
        </View>
        <View style={styles.auditMeta}>
          <ThemedText style={styles.auditMetaText}>
            <User size={12} /> {log.userName}
          </ThemedText>
          <ThemedText style={styles.auditMetaText}>{log.module}</ThemedText>
        </View>
        <ThemedText style={styles.auditTimestamp}>
          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
        </ThemedText>
        {log.details && <ThemedText style={styles.auditDetails}>{log.details}</ThemedText>}
        {log.ipAddress && <ThemedText style={styles.auditIP}>IP: {log.ipAddress}</ThemedText>}
      </View>
    </View>
  );
};

const AuditTrail = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<{
    module?: string;
    action?: string;
  }>({});

  const { data: logs = [], isLoading, refetch } = trpc.audit.getLogs.useQuery({ filters });
  const { data: summary } = trpc.audit.getSummary.useQuery();

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
        {/* Summary Cards */}
        {summary && (
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Eye size={20} color="#3b82f6" />
              <ThemedText style={styles.summaryLabel}>Total Logs</ThemedText>
              <ThemedText style={styles.summaryValue}>{summary.totalLogs}</ThemedText>
            </View>
            <View style={styles.summaryCard}>
              <Shield size={20} color="#10b981" />
              <ThemedText style={styles.summaryLabel}>Successful</ThemedText>
              <ThemedText style={styles.summaryValue}>{summary.successCount}</ThemedText>
            </View>
            <View style={styles.summaryCard}>
              <Lock size={20} color="#dc2626" />
              <ThemedText style={styles.summaryLabel}>Failed</ThemedText>
              <ThemedText style={styles.summaryValue}>{summary.failureCount}</ThemedText>
            </View>
          </View>
        )}

        {/* Audit Logs List */}
        <View style={styles.logsSection}>
          <ThemedText style={styles.sectionTitle}>Audit Trail</ThemedText>
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AuditLogItem log={item} />}
            scrollEnabled={false}
            ListEmptyComponent={
              <ThemedView style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No audit logs</ThemedText>
              </ThemedView>
            }
          />
        </View>
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
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  auditItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  actionIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  auditContent: {
    flex: 1,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  auditAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  auditMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  auditMetaText: {
    fontSize: 11,
    color: '#666',
  },
  auditTimestamp: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  auditDetails: {
    fontSize: 11,
    color: '#555',
    fontStyle: 'italic',
  },
  auditIP: {
    fontSize: 10,
    color: '#ccc',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#999',
  },
});

export default AuditTrail;
