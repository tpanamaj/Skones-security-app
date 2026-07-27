import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { trpc } from '@/lib/trpc';
import { TrendingUp, Users, Award, Target } from 'lucide-react-native';

interface PerformanceMetrics {
  guardId: string;
  attendance: number;
  conduct: number;
  training: number;
  punctuality: number;
  efficiency: number;
  overallScore: number;
  trend: number[];
  rank: number;
  badges: string[];
}

const PerformanceCard = ({ metric, label, value }: { metric: string; label: string; value: number }) => {
  const getColor = (val: number) => {
    if (val >= 80) return '#10b981';
    if (val >= 60) return '#f59e0b';
    return '#dc2626';
  };

  const color = getColor(value);

  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricCircle, { borderColor: color }]}>
        <ThemedText style={[styles.metricValue, { color }]}>{value}%</ThemedText>
      </View>
      <ThemedText style={styles.metricLabel}>{label}</ThemedText>
    </View>
  );
};

const RankingBadge = ({ rank, totalGuards }: { rank: number; totalGuards: number }) => {
  const percentage = ((totalGuards - rank) / totalGuards) * 100;
  const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🎯';

  return (
    <View style={styles.rankingCard}>
      <ThemedText style={styles.medalEmoji}>{medalEmoji}</ThemedText>
      <View style={styles.rankingInfo}>
        <ThemedText style={styles.rankingTitle}>Rank #{rank} of {totalGuards}</ThemedText>
        <ThemedText style={styles.rankingPercentage}>Top {Math.round(percentage)}% Performer</ThemedText>
      </View>
    </View>
  );
};

const GuardPerformanceAnalytics = ({ guardId }: { guardId: string }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const { data: performance, isLoading } = trpc.performance.getGuardMetrics.useQuery({ guardId, timeRange });
  const { data: leaderboard } = trpc.performance.getLeaderboard.useQuery({ limit: 10 });
  const { data: trends } = trpc.performance.getTrends.useQuery({ guardId });

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!performance) {
    return <ThemedText>No data available</ThemedText>;
  }

  const chartWidth = Dimensions.get('window').width - 32;

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Overall Score */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <ThemedText style={styles.scoreValue}>{performance.overallScore}</ThemedText>
            <ThemedText style={styles.scoreLabel}>Overall Score</ThemedText>
          </View>
          {performance.rank && (
            <RankingBadge rank={performance.rank} totalGuards={leaderboard?.length || 100} />
          )}
        </View>

        {/* Performance Metrics Grid */}
        <View style={styles.metricsGrid}>
          <PerformanceCard metric="attendance" label="Attendance" value={performance.attendance} />
          <PerformanceCard metric="conduct" label="Conduct" value={performance.conduct} />
          <PerformanceCard metric="training" label="Training" value={performance.training} />
          <PerformanceCard metric="punctuality" label="Punctuality" value={performance.punctuality} />
        </View>

        {/* Badges */}
        {performance.badges && performance.badges.length > 0 && (
          <View style={styles.badgesSection}>
            <ThemedText style={styles.sectionTitle}>Achievements</ThemedText>
            <View style={styles.badgesContainer}>
              {performance.badges.map((badge, idx) => (
                <View key={idx} style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{badge}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Time Range Filter */}
        <View style={styles.timeRangeFilter}>
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <ThemedText style={styles.timeRangeText}>{range.charAt(0).toUpperCase() + range.slice(1)}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trend Chart */}
        {trends && trends.data?.length > 0 && (
          <View style={styles.chartSection}>
            <ThemedText style={styles.sectionTitle}>Performance Trend</ThemedText>
            <LineChart
              data={{
                labels: trends.labels || [],
                datasets: [{
                  data: trends.data || [],
                }],
              }}
              width={chartWidth}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: () => '#3b82f6',
                strokeWidth: 2,
              }}
              style={styles.chart}
            />
          </View>
        )}

        {/* Leaderboard */}
        {leaderboard && (
          <View style={styles.leaderboardSection}>
            <ThemedText style={styles.sectionTitle}>Top Performers</ThemedText>
            {leaderboard.slice(0, 5).map((guard: any, idx: number) => (
              <View key={idx} style={styles.leaderboardItem}>
                <View style={styles.leaderboardRank}>
                  <ThemedText style={styles.leaderboardRankText}>#{idx + 1}</ThemedText>
                </View>
                <View style={styles.leaderboardInfo}>
                  <ThemedText style={styles.leaderboardName}>{guard.name}</ThemedText>
                  <ThemedText style={styles.leaderboardScore}>{guard.score} points</ThemedText>
                </View>
                <ThemedText style={styles.leaderboardScore}>{guard.score}%</ThemedText>
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
  scoreSection: {
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  badgesSection: {
    marginBottom: 24,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  timeRangeFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartSection: {
    marginBottom: 24,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  leaderboardSection: {
    marginBottom: 24,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaderboardRankText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  leaderboardScore: {
    fontSize: 12,
    color: '#666',
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  medalEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  rankingPercentage: {
    fontSize: 12,
    color: '#3b82f6',
  },
});

export default GuardPerformanceAnalytics;
