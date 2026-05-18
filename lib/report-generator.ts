import { PayrollEntry, Incident, Guard } from './types';

/**
 * Report Generation System
 * Generates comprehensive reports for all data types
 */

/**
 * Generate payroll report
 * @param entries - Payroll entries
 * @returns Payroll report data
 */
export function generatePayrollReport(entries: PayrollEntry[]) {
  const total = entries.reduce((sum, e) => sum + e.totalAmount, 0);
  const byStatus = {
    pending: entries.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.totalAmount, 0),
    approved: entries.filter((e) => e.status === 'approved').reduce((sum, e) => sum + e.totalAmount, 0),
    paid: entries.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.totalAmount, 0),
    rejected: entries.filter((e) => e.status === 'rejected').reduce((sum, e) => sum + e.totalAmount, 0),
  };

  return {
    reportDate: new Date().toISOString(),
    title: 'Payroll Report',
    period: entries.length > 0 ? entries[0].period : 'N/A',
    summary: {
      totalEntries: entries.length,
      totalAmount: Math.round(total * 100) / 100,
      avgAmount: entries.length > 0 ? Math.round((total / entries.length) * 100) / 100 : 0,
    },
    byStatus: {
      pending: { count: entries.filter((e) => e.status === 'pending').length, amount: Math.round(byStatus.pending * 100) / 100 },
      approved: { count: entries.filter((e) => e.status === 'approved').length, amount: Math.round(byStatus.approved * 100) / 100 },
      paid: { count: entries.filter((e) => e.status === 'paid').length, amount: Math.round(byStatus.paid * 100) / 100 },
      rejected: { count: entries.filter((e) => e.status === 'rejected').length, amount: Math.round(byStatus.rejected * 100) / 100 },
    },
  };
}

/**
 * Generate performance report
 * @param guards - Guards to report on
 * @returns Performance report data
 */
export function generatePerformanceReport(guards: Guard[]) {
  const avg = guards.length > 0 ? guards.reduce((sum, g) => sum + g.meritScore, 0) / guards.length : 0;

  return {
    reportDate: new Date().toISOString(),
    title: 'Performance Report',
    summary: {
      totalGuards: guards.length,
      avgScore: Math.round(avg * 10) / 10,
      topScorers: guards
        .sort((a, b) => b.meritScore - a.meritScore)
        .slice(0, 5)
        .map((g) => ({ name: g.name, score: g.meritScore, status: g.status })),
    },
    scoreDistribution: {
      excellent: guards.filter((g) => g.meritScore >= 90).length,
      good: guards.filter((g) => g.meritScore >= 80 && g.meritScore < 90).length,
      average: guards.filter((g) => g.meritScore >= 70 && g.meritScore < 80).length,
      needsImprovement: guards.filter((g) => g.meritScore < 70).length,
    },
  };
}

/**
 * Generate incident report
 * @param incidents - Incidents to report on
 * @returns Incident report data
 */
export function generateIncidentReport(incidents: Incident[]) {
  return {
    reportDate: new Date().toISOString(),
    title: 'Incident Report',
    summary: {
      total: incidents.length,
      critical: incidents.filter((i) => i.severity === 'critical').length,
      unresolved: incidents.filter((i) => i.status !== 'closed').length,
    },
    byType: {
      theft: incidents.filter((i) => i.type === 'theft').length,
      breach: incidents.filter((i) => i.type === 'breach').length,
      injury: incidents.filter((i) => i.type === 'injury').length,
      equipmentDamage: incidents.filter((i) => i.type === 'equipment_damage').length,
      unauthorizedAccess: incidents.filter((i) => i.type === 'unauthorized_access').length,
      other: incidents.filter((i) => i.type === 'other').length,
    },
    bySeverity: {
      critical: incidents.filter((i) => i.severity === 'critical').length,
      high: incidents.filter((i) => i.severity === 'high').length,
      medium: incidents.filter((i) => i.severity === 'medium').length,
      low: incidents.filter((i) => i.severity === 'low').length,
    },
  };
}

/**
 * Generate deployment report
 * @param posts - Deployment posts
 * @param guards - All guards
 * @returns Deployment report data
 */
export function generateDeploymentReport(posts: any[], guards: Guard[]) {
  const assigned = guards.filter((g) => g.currentDeploymentPostId).length;
  const utilization = guards.length > 0 ? Math.round((assigned / guards.length) * 100) : 0;

  return {
    reportDate: new Date().toISOString(),
    title: 'Deployment Report',
    summary: {
      totalPosts: posts.length,
      activePosts: posts.filter((p) => p.status === 'active').length,
      totalGuards: guards.length,
      deployedGuards: assigned,
      utilizationRate: utilization,
    },
    postDetails: posts.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      required: p.guardsRequired,
      assigned: p.assignedGuards?.length || 0,
      location: p.location,
    })),
  };
}

/**
 * Export report to CSV
 * @param report - Report object
 * @param headers - Column headers
 * @param rows - Data rows
 * @returns CSV string
 */
export function exportReportToCSV(report: any, headers: string[], rows: any[][]): string {
  const headerRow = headers.join(',');
  const dataRows = rows.map((row) => row.map((cell) => `"${cell}"`).join(','));
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Export report to JSON
 * @param report - Report object
 * @returns JSON string
 */
export function exportReportToJSON(report: any): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Create PDF report (placeholder)
 * @param report - Report object
 * @param title - Report title
 * @returns PDF content (as string)
 */
export function createPDFReport(report: any, title: string): string {
  // This is a placeholder - actual PDF generation would use a library like pdfkit
  return JSON.stringify({
    format: 'PDF',
    title,
    content: report,
    generated: new Date().toISOString(),
  });
}

/**
 * Generate summary statistics
 * @param payrollData - Payroll entries
 * @param guardData - Guards
 * @param incidentData - Incidents
 * @returns Summary statistics
 */
export function generateSummaryStats(payrollData: PayrollEntry[], guardData: Guard[], incidentData: Incident[]) {
  return {
    timestamp: new Date().toISOString(),
    payroll: {
      totalAmount: Math.round(payrollData.reduce((sum, e) => sum + e.totalAmount, 0) * 100) / 100,
      processed: payrollData.filter((e) => e.status === 'paid').length,
      pending: payrollData.filter((e) => e.status === 'pending').length,
    },
    guards: {
      total: guardData.length,
      onDuty: guardData.filter((g) => g.status === 'on_duty').length,
      offDuty: guardData.filter((g) => g.status === 'off_duty').length,
      avgScore: guardData.length > 0 ? Math.round((guardData.reduce((sum, g) => sum + g.meritScore, 0) / guardData.length) * 10) / 10 : 0,
    },
    incidents: {
      total: incidentData.length,
      critical: incidentData.filter((i) => i.severity === 'critical').length,
      resolved: incidentData.filter((i) => i.status === 'closed').length,
    },
  };
}

/**
 * Generate trending data
 * @param historicalData - Historical data points
 * @param metric - Metric to analyze
 * @returns Trend analysis
 */
export function generateTrendingData(historicalData: any[], metric: string) {
  if (historicalData.length < 2) {
    return { trend: 'insufficient_data', change: 0 };
  }

  const recent = historicalData[historicalData.length - 1][metric];
  const previous = historicalData[historicalData.length - 2][metric];
  const change = recent - previous;
  const percentChange = previous !== 0 ? ((change / previous) * 100) : 0;

  return {
    metric,
    recent,
    previous,
    change,
    percentChange: Math.round(percentChange * 100) / 100,
    trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
  };
}

/**
 * Calculate key performance indicators
 * @param payrollData - Payroll entries
 * @param guardData - Guards
 * @param incidentData - Incidents
 * @returns KPI dashboard
 */
export function calculateKPIs(payrollData: PayrollEntry[], guardData: Guard[], incidentData: Incident[]) {
  return {
    payroll: {
      totalProcessed: payrollData.filter((e) => e.status === 'paid').length,
      processingRate: payrollData.length > 0 ? Math.round(((payrollData.filter((e) => e.status === 'paid').length / payrollData.length) * 100)) : 0,
      avgAmount: payrollData.length > 0 ? Math.round((payrollData.reduce((sum, e) => sum + e.totalAmount, 0) / payrollData.length) * 100) / 100 : 0,
    },
    guards: {
      utilization: guardData.length > 0 ? Math.round(((guardData.filter((g) => g.currentDeploymentPostId).length / guardData.length) * 100)) : 0,
      avgPerformance: guardData.length > 0 ? Math.round((guardData.reduce((sum, g) => sum + g.meritScore, 0) / guardData.length) * 10) / 10 : 0,
      topPerformer: guardData.length > 0 ? guardData.sort((a, b) => b.meritScore - a.meritScore)[0].name : 'N/A',
    },
    incidents: {
      incidentRate: incidentData.length > 0 ? (incidentData.length / 30).toFixed(2) : '0', // per day average
      criticalIncidents: incidentData.filter((i) => i.severity === 'critical').length,
      resolutionRate: incidentData.length > 0 ? Math.round(((incidentData.filter((i) => i.status === 'closed').length / incidentData.length) * 100)) : 0,
    },
  };
}
