import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-context';
import { useColors } from '@/hooks/use-colors';
import { PaymentStatus } from '@/lib/types';

const statusColors: Record<PaymentStatus, string> = {
  pending: '#F59E0B',
  approved: '#3B82F6',
  paid: '#22C55E',
  rejected: '#EF4444',
};

const statusLabels: Record<PaymentStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
};

export default function ReportsScreen() {
  const colors = useColors();
  const { payrollEntries } = useAppData();
  const [selectedTab, setSelectedTab] = useState<'payroll' | 'reports'>('payroll');

  const payrollStats = {
    total: payrollEntries.length,
    pending: payrollEntries.filter((p) => p.status === 'pending').length,
    approved: payrollEntries.filter((p) => p.status === 'approved').length,
    paid: payrollEntries.filter((p) => p.status === 'paid').length,
    totalAmount: payrollEntries.reduce((sum, p) => sum + p.totalAmount, 0),
  };

  const renderPayrollCard = ({ item }: { item: (typeof payrollEntries)[0] }) => (
    <TouchableOpacity
      className="bg-surface rounded-lg p-4 mb-3 border border-border"
      style={{ borderColor: colors.border }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">
            {item.guardName}
          </Text>
          <Text className="text-sm text-muted">{item.period}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: statusColors[item.status] }}
        >
          <Text className="text-xs font-semibold text-white">
            {statusLabels[item.status]}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-3">
        <View>
          <Text className="text-xs text-muted mb-1">Hours Worked</Text>
          <Text className="text-lg font-bold text-foreground">
            {item.hoursWorked}h
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted mb-1">Amount Due</Text>
          <Text className="text-lg font-bold text-primary">
            GHS {item.totalAmount.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const reportTypes = [
    { id: '1', name: 'Guard Performance Report', icon: '📊' },
    { id: '2', name: 'Payroll Summary', icon: '💰' },
    { id: '3', name: 'Deployment Schedule', icon: '📅' },
    { id: '4', name: 'Incident Report', icon: '⚠️' },
    { id: '5', name: 'Attendance Report', icon: '✓' },
  ];

  const renderReportCard = ({ item }: { item: (typeof reportTypes)[0] }) => (
    <TouchableOpacity
      className="bg-surface rounded-lg p-4 mb-3 border border-border flex-row items-center gap-4"
      style={{ borderColor: colors.border }}
    >
      <Text className="text-4xl">{item.icon}</Text>
      <View className="flex-1">
        <Text className="text-base font-bold text-foreground">{item.name}</Text>
        <Text className="text-xs text-muted mt-1">Generate & export report</Text>
      </View>
      <Text className="text-primary text-xl">→</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground mb-4">
          Reports & Payroll
        </Text>

        {/* Tab Buttons */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={() => setSelectedTab('payroll')}
            className="flex-1 py-3 rounded-lg items-center"
            style={{
              backgroundColor:
                selectedTab === 'payroll' ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              className="font-bold text-sm"
              style={{
                color:
                  selectedTab === 'payroll' ? colors.background : colors.foreground,
              }}
            >
              Payroll
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('reports')}
            className="flex-1 py-3 rounded-lg items-center"
            style={{
              backgroundColor:
                selectedTab === 'reports' ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              className="font-bold text-sm"
              style={{
                color:
                  selectedTab === 'reports' ? colors.background : colors.foreground,
              }}
            >
              Reports
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedTab === 'payroll' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Payroll Stats */}
          <View className="bg-surface rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold text-foreground mb-4">
              Payroll Summary
            </Text>
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Total Guards</Text>
                <Text className="text-sm font-bold text-foreground">
                  {payrollStats.total}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Pending</Text>
                <Text className="text-sm font-bold" style={{ color: '#F59E0B' }}>
                  {payrollStats.pending}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Approved</Text>
                <Text className="text-sm font-bold" style={{ color: '#3B82F6' }}>
                  {payrollStats.approved}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Paid</Text>
                <Text className="text-sm font-bold" style={{ color: '#22C55E' }}>
                  {payrollStats.paid}
                </Text>
              </View>
              <View className="border-t border-border pt-3 mt-3 flex-row justify-between">
                <Text className="text-sm font-bold text-foreground">
                  Total Amount
                </Text>
                <Text className="text-lg font-bold text-primary">
                  GHS {payrollStats.totalAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Payroll Entries */}
          <Text className="text-lg font-bold text-foreground mb-3">
            Guard Payroll
          </Text>
          <FlatList
            data={payrollEntries}
            renderItem={renderPayrollCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            nestedScrollEnabled={true}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={reportTypes}
          renderItem={renderReportCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          nestedScrollEnabled={true}
        />
      )}
    </ScreenContainer>
  );
}
