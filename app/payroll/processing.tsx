import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { trpc } from '@/lib/trpc';
import { Calendar, Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react-native';
import { format } from 'date-fns';

interface PayrollCycle {
  id: string;
  period: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'submitted' | 'approved' | 'paid';
  totalAmount: number;
  guardCount: number;
  deductions: number;
  taxes: number;
}

interface PayrollBatch {
  cycleId: string;
  guardId: string;
  guardName: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  taxes: number;
  netPay: number;
  status: 'pending' | 'approved' | 'paid';
}

const PayrollSummaryCard = ({ cycle }: { cycle: PayrollCycle }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: '#6b7280',
      submitted: '#f59e0b',
      approved: '#3b82f6',
      paid: '#10b981',
    };
    return colors[status] || '#gray';
  };

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View>
          <ThemedText style={styles.summaryPeriod}>{cycle.period}</ThemedText>
          <ThemedText style={styles.summaryDates}>
            {format(new Date(cycle.startDate), 'MMM dd')} - {format(new Date(cycle.endDate), 'MMM dd, yyyy')}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(cycle.status) }]}>
          <ThemedText style={styles.statusText}>{cycle.status.toUpperCase()}</ThemedText>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Total Guards</ThemedText>
          <ThemedText style={styles.summaryValue}>{cycle.guardCount}</ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Total Payout</ThemedText>
          <ThemedText style={styles.summaryValue}>GH₵{cycle.totalAmount.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Deductions</ThemedText>
          <ThemedText style={styles.summaryValue}>GH₵{cycle.deductions.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.summaryItem}>
          <ThemedText style={styles.summaryLabel}>Taxes</ThemedText>
          <ThemedText style={styles.summaryValue}>GH₵{cycle.taxes.toLocaleString()}</ThemedText>
        </View>
      </View>
    </View>
  );
};

const PayrollItemCard = ({ item }: { item: PayrollBatch }) => {
  const getStatusColor = (status: string) => {
    if (status === 'paid') return '#10b981';
    if (status === 'approved') return '#3b82f6';
    return '#f59e0b';
  };

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <ThemedText style={styles.itemName}>{item.guardName}</ThemedText>
          <ThemedText style={styles.itemId}>{item.guardId}</ThemedText>
        </View>
        <View style={[styles.itemStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          {item.status === 'paid' ? (
            <CheckCircle size={16} color="#fff" />
          ) : (
            <AlertCircle size={16} color="#fff" />
          )}
        </View>
      </View>

      <View style={styles.itemDetails}>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Base Salary:</ThemedText>
          <ThemedText style={styles.detailValue}>GH₵{item.baseSalary.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Allowances:</ThemedText>
          <ThemedText style={styles.detailValue}>GH₵{item.allowances.toLocaleString()}</ThemedText>
        </View>
        <View style={styles.detailRow}>
          <ThemedText style={styles.detailLabel}>Deductions:</ThemedText>
          <ThemedText style={styles.detailValue}>-GH₵{item.deductions.toLocaleString()}</ThemedText>
        </View>
        <View style={[styles.detailRow, styles.detailRowHighlight]}>
          <ThemedText style={styles.detailLabel}>Net Pay:</ThemedText>
          <ThemedText style={styles.detailValueHighlight}>GH₵{item.netPay.toLocaleString()}</ThemedText>
        </View>
      </View>
    </View>
  );
};

const PayrollProcessing = () => {
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'completed'>('idle');

  const { data: cycles = [], isLoading: cyclesLoading } = trpc.payroll.getCycles.useQuery();
  const { data: batchItems = [], isLoading: batchLoading } = trpc.payroll.getBatch.useQuery(
    { cycleId: selectedCycle! },
    { enabled: !!selectedCycle }
  );

  const approveMutation = trpc.payroll.approveCycle.useMutation();
  const processMutation = trpc.payroll.processBatch.useMutation();

  const handleApproveCycle = async (cycleId: string) => {
    try {
      setProcessingState('processing');
      await approveMutation.mutateAsync({ cycleId });
      setProcessingState('completed');
      setTimeout(() => setProcessingState('idle'), 2000);
    } catch (error) {
      console.error('Error approving cycle:', error);
      setProcessingState('idle');
    }
  };

  const handleProcessBatch = async (cycleId: string) => {
    try {
      setProcessingState('processing');
      await processMutation.mutateAsync({ cycleId });
      setProcessingState('completed');
      setTimeout(() => setProcessingState('idle'), 2000);
    } catch (error) {
      console.error('Error processing batch:', error);
      setProcessingState('idle');
    }
  };

  if (cyclesLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const currentCycle = cycles.find((c: PayrollCycle) => c.id === selectedCycle) || cycles[0];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Cycles Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Payroll Cycles</ThemedText>
          <FlatList
            data={cycles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.cycleButton,
                  selectedCycle === item.id && styles.cycleButtonActive,
                ]}
                onPress={() => setSelectedCycle(item.id)}
              >
                <Calendar size={20} color={selectedCycle === item.id ? '#fff' : '#666'} />
                <View style={styles.cycleButtonText}>
                  <ThemedText style={[styles.cycleButtonTitle, selectedCycle === item.id && { color: '#fff' }]}>
                    {item.period}
                  </ThemedText>
                  <ThemedText style={[styles.cycleButtonSubtitle, selectedCycle === item.id && { color: '#dbeafe' }]}>
                    {item.guardCount} guards
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
            horizontal
          />
        </View>

        {/* Cycle Summary */}
        {currentCycle && <PayrollSummaryCard cycle={currentCycle} />}

        {/* Action Buttons */}
        {currentCycle && (
          <View style={styles.actionButtons}>
            {currentCycle.status === 'draft' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => handleApproveCycle(currentCycle.id)}
                disabled={processingState === 'processing'}
              >
                {processingState === 'processing' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.actionButtonText}>Submit for Approval</ThemedText>
                )}
              </TouchableOpacity>
            )}
            {currentCycle.status === 'approved' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSuccess]}
                onPress={() => handleProcessBatch(currentCycle.id)}
                disabled={processingState === 'processing'}
              >
                {processingState === 'processing' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.actionButtonText}>Process Payment</ThemedText>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Batch Items */}
        {selectedCycle && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Guard Payroll Details</ThemedText>
            <FlatList
              data={batchItems}
              keyExtractor={(item) => `${item.cycleId}-${item.guardId}`}
              renderItem={({ item }) => <PayrollItemCard item={item} />}
              scrollEnabled={false}
              ListEmptyComponent={<ThemedText style={styles.emptyText}>No payroll items</ThemedText>}
            />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cycleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginRight: 8,
  },
  cycleButtonActive: {
    backgroundColor: '#3b82f6',
  },
  cycleButtonText: {
    marginLeft: 12,
  },
  cycleButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  cycleButtonSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryPeriod: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryDates: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#f59e0b',
  },
  actionButtonSuccess: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemId: {
    fontSize: 12,
    color: '#666',
  },
  itemStatusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailRowHighlight: {
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailValueHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
});

export default PayrollProcessing;
