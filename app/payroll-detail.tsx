import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-context';
import { useColors } from '@/hooks/use-colors';

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  approved: '#3B82F6',
  paid: '#22C55E',
  rejected: '#EF4444',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
};

export default function PayrollDetailScreen() {
  const colors = useColors();
  const { payrollId } = useLocalSearchParams<{ payrollId: string }>();
  const { payrollEntries, updatePayrollEntry } = useAppData();

  const payroll = payrollEntries.find((p) => p.id === payrollId);

  if (!payroll) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Payroll entry not found</Text>
      </ScreenContainer>
    );
  }

  const handleApprove = () => {
    updatePayrollEntry(payroll.id, {
      status: 'approved',
      approvedBy: 'Current User',
      approvalDate: new Date().toISOString(),
    });
    Alert.alert('Success', 'Payroll entry approved');
  };

  const handleMarkPaid = () => {
    updatePayrollEntry(payroll.id, {
      status: 'paid',
      paidDate: new Date().toISOString(),
    });
    Alert.alert('Success', 'Payroll marked as paid');
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground mb-1">
                {payroll.guardName}
              </Text>
              <Text className="text-sm text-muted">{payroll.period}</Text>
            </View>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: statusColors[payroll.status] }}
            >
              <Text className="text-xs font-semibold text-white">
                {statusLabels[payroll.status]}
              </Text>
            </View>
          </View>

          <View className="bg-background rounded-lg p-3">
            <Text className="text-xs text-muted mb-1">TOTAL AMOUNT DUE</Text>
            <Text className="text-3xl font-bold text-primary">
              GHS {payroll.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Work Details */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">
            Work Details
          </Text>
          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Days Worked</Text>
              <Text className="text-sm font-semibold text-foreground">
                {payroll.daysWorked}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Regular Hours</Text>
              <Text className="text-sm font-semibold text-foreground">
                {payroll.hoursWorked}h
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Hourly Rate</Text>
              <Text className="text-sm font-semibold text-foreground">
                GHS {payroll.hourlyRate.toFixed(2)}/h
              </Text>
            </View>
            <View className="border-t border-border pt-3 mt-3 flex-row justify-between">
              <Text className="text-sm font-semibold text-foreground">
                Regular Pay
              </Text>
              <Text className="text-sm font-bold text-primary">
                GHS {(payroll.hoursWorked * payroll.hourlyRate).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Overtime */}
        {payroll.overtimeHours > 0 && (
          <View className="bg-surface rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold text-foreground mb-3">
              Overtime
            </Text>
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Overtime Hours</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {payroll.overtimeHours}h
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Overtime Rate</Text>
                <Text className="text-sm font-semibold text-foreground">
                  GHS {payroll.overtimeRate.toFixed(2)}/h
                </Text>
              </View>
              <View className="border-t border-border pt-3 mt-3 flex-row justify-between">
                <Text className="text-sm font-semibold text-foreground">
                  Overtime Pay
                </Text>
                <Text className="text-sm font-bold text-primary">
                  GHS {(payroll.overtimeHours * payroll.overtimeRate).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Deductions */}
        {payroll.deductions > 0 && (
          <View className="bg-surface rounded-lg p-4 mb-4">
            <Text className="text-lg font-bold text-foreground mb-3">
              Deductions
            </Text>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Total Deductions</Text>
              <Text className="text-sm font-semibold text-error">
                -GHS {payroll.deductions.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Summary */}
        <View className="bg-primary rounded-lg p-4 mb-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-semibold text-background">
              Net Amount
            </Text>
            <Text className="text-2xl font-bold text-background">
              GHS {payroll.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Payment History */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-lg font-bold text-foreground mb-3">
            Payment History
          </Text>
          <View className="gap-2">
            {payroll.approvalDate && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Approved</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {new Date(payroll.approvalDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            {payroll.paidDate && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Paid</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {new Date(payroll.paidDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {payroll.status === 'pending' && (
          <View className="gap-3 mb-6">
            <TouchableOpacity
              onPress={handleApprove}
              className="py-3 rounded-lg items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-base font-bold text-background">
                Approve Payroll
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {payroll.status === 'approved' && (
          <View className="gap-3 mb-6">
            <TouchableOpacity
              onPress={handleMarkPaid}
              className="py-3 rounded-lg items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-base font-bold text-background">
                Mark as Paid
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {payroll.status === 'paid' && (
          <View className="gap-3 mb-6">
            <TouchableOpacity
              className="py-3 rounded-lg items-center border border-border"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-base font-bold text-primary">
                Download Receipt
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
