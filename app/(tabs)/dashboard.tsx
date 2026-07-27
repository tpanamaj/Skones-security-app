import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { trpc } from '@/lib/trpc';
import { BarChart3, AlertCircle, Users, Briefcase, TrendingUp } from 'lucide-react-native';
import { useCallback } from 'react';

const DashboardWidget = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  onPress,
}: {
  icon: any;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={[styles.widget, { borderLeftColor: color }]} onPress={onPress}>
    <View style={styles.widgetHeader}>
      <Icon size={24} color={color} />
      <ThemedText style={styles.widgetTitle}>{title}</ThemedText>
    </View>
    <ThemedText style={styles.widgetValue}>{value}</ThemedText>
    {subtitle && <ThemedText style={styles.widgetSubtitle}>{subtitle}</ThemedText>}
  </TouchableOpacity>
);

const MobileDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: summary, isLoading, refetch } = trpc.dashboard.getSummary.useQuery();
  const { data: alerts } = trpc.dashboard.getAlerts.useQuery();
  const { data: tasks } = trpc.dashboard.getUpcomingTasks.useQuery();

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
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>Good Morning</ThemedText>
          <ThemedText style={styles.subGreeting}>Skones Security Management</ThemedText>
        </View>

        {/* Key Metrics */}
        {summary && (
          <View style={styles.metricsSection}>
            <ThemedText style={styles.sectionTitle}>Overview</ThemedText>
            <DashboardWidget
              icon={AlertCircle}
              title="Active Incidents"
              value={summary.activeIncidents}
              subtitle="Requires attention"
              color="#dc2626"
            />
            <DashboardWidget
              icon={Users}
              title="Guards On Duty"
              value={summary.guardsOnDuty}
              subtitle={`of ${summary.totalGuards}`}
              color="#10b981"
            />
            <DashboardWidget
              icon={Briefcase}
              title="Pending Approvals"
              value={summary.pendingApprovals}
              subtitle="Awaiting action"
              color="#f59e0b"
            />
            <DashboardWidget
              icon={TrendingUp}
              title="Performance Score"
              value={`${summary.performanceScore}%`}
              subtitle="Team average"
              color="#3b82f6"
            />
          </View>
        )}

        {/* Critical Alerts */}
        {alerts && alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <ThemedText style={styles.sectionTitle}>Critical Alerts</ThemedText>
            {alerts.slice(0, 3).map((alert: any, idx: number) => (
              <View key={idx} style={styles.alertItem}>
                <View style={[styles.alertIndicator, { backgroundColor: alert.color }]} />
                <View style={styles.alertContent}>
                  <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
                  <ThemedText style={styles.alertMessage}>{alert.message}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Upcoming Tasks */}
        {tasks && tasks.length > 0 && (
          <View style={styles.tasksSection}>
            <ThemedText style={styles.sectionTitle}>Upcoming Tasks</ThemedText>
            {tasks.slice(0, 5).map((task: any, idx: number) => (
              <View key={idx} style={styles.taskItem}>
                <View style={[styles.taskCheckbox, { backgroundColor: task.completed ? '#10b981' : '#e5e7eb' }]} />
                <View style={styles.taskContent}>
                  <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>
                  <ThemedText style={styles.taskTime}>{task.dueTime}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
  },
  metricsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  widget: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  widgetValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  widgetSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  alertsSection: {
    marginBottom: 24,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 12,
    color: '#666',
  },
  tasksSection: {
    marginBottom: 24,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default MobileDashboard;
