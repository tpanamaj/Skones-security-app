import { Guard, MeritScore, MeritScoreEntry } from './types';

/**
 * Guard Management System
 * Handles guard operations, assignments, and performance tracking
 */

/**
 * Update guard status
 * @param guard - Guard to update
 * @param newStatus - New status
 * @returns Updated guard
 */
export function updateGuardStatus(
  guard: Guard,
  newStatus: 'on_duty' | 'off_duty' | 'on_leave' | 'sick' | 'suspended'
): Guard {
  if (newStatus === 'on_duty') {
    return {
      ...guard,
      status: newStatus,
      lastCheckIn: new Date().toISOString(),
    };
  }

  return {
    ...guard,
    status: newStatus,
  };
}

/**
 * Assign guard to post
 * @param guard - Guard to assign
 * @param postId - Post ID
 * @returns Updated guard
 */
export function assignGuardToPost(guard: Guard, postId: string): Guard {
  if (guard.status === 'suspended') {
    throw new Error('Cannot assign suspended guard');
  }

  return {
    ...guard,
    currentDeploymentPostId: postId,
    status: 'on_duty',
  };
}

/**
 * Remove guard from post
 * @param guard - Guard to remove
 * @returns Updated guard
 */
export function removeGuardFromPost(guard: Guard): Guard {
  return {
    ...guard,
    currentDeploymentPostId: undefined,
    status: 'off_duty',
  };
}

/**
 * Calculate merit score
 * @param entries - Merit score entries
 * @returns Overall merit score
 */
export function calculateMeritScore(entries: MeritScoreEntry[]): number {
  if (entries.length === 0) return 0;

  const categories = {
    attendance: 0,
    performance: 0,
    conduct: 0,
    training: 0,
  };

  entries.forEach((entry) => {
    categories[entry.category] += entry.change;
  });

  const weights = {
    attendance: 0.25,
    performance: 0.35,
    conduct: 0.25,
    training: 0.15,
  };

  let total = 0;
  Object.keys(categories).forEach((key: string) => {
    const categoryKey = key as keyof typeof categories;
    total += (categories[categoryKey] || 0) * weights[categoryKey as keyof typeof weights];
  });

  return Math.min(100, Math.max(0, Math.round(total * 10) / 10));
}

/**
 * Adjust merit score
 * @param meritScore - Current merit score
 * @param category - Category to adjust
 * @param change - Change amount
 * @param reason - Reason for adjustment
 * @param adjustedBy - Who made the adjustment
 * @returns Updated merit score with entry
 */
export function adjustMeritScore(
  meritScore: MeritScore,
  category: 'attendance' | 'performance' | 'conduct' | 'training',
  change: number,
  reason: string,
  adjustedBy?: string
): MeritScore {
  const newEntry: MeritScoreEntry = {
    date: new Date().toISOString(),
    category,
    change,
    reason,
    adjustedBy,
  };

  const updatedHistory = [newEntry, ...meritScore.history];
  const newOverall = calculateMeritScore(updatedHistory);

  return {
    ...meritScore,
    overall: newOverall,
    [category]: Math.max(0, Math.min(100, meritScore[category as keyof Omit<MeritScore, 'history' | 'guardId' | 'overall' | 'lastUpdated'>] + change)),
    lastUpdated: new Date().toISOString(),
    history: updatedHistory,
  };
}

/**
 * Get merit score trend
 * @param meritScore - Merit score with history
 * @param days - Number of days to analyze
 * @returns Trend data
 */
export function getMeritScoreTrend(meritScore: MeritScore, days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recentEntries = meritScore.history.filter(
    (entry) => new Date(entry.date) >= cutoff
  );

  const totalChange = recentEntries.reduce((sum, entry) => sum + entry.change, 0);
  const trend = totalChange > 0 ? 'improving' : totalChange < 0 ? 'declining' : 'stable';

  return {
    period: `${days} days`,
    totalChange,
    entriesCount: recentEntries.length,
    trend,
    currentScore: meritScore.overall,
  };
}

/**
 * Get performance badge
 * @param score - Merit score
 * @returns Badge name
 */
export function getPerformanceBadge(score: number): string {
  if (score >= 90) return 'Platinum';
  if (score >= 80) return 'Gold';
  if (score >= 70) return 'Silver';
  if (score >= 60) return 'Bronze';
  return 'Standard';
}

/**
 * Filter guards
 * @param guards - Guards to filter
 * @param filters - Filter criteria
 * @returns Filtered guards
 */
export function filterGuards(
  guards: Guard[],
  filters: {
    status?: Guard['status'];
    postId?: string;
    minScore?: number;
    maxScore?: number;
    certification?: string;
  }
): Guard[] {
  return guards.filter((guard) => {
    if (filters.status && guard.status !== filters.status) return false;
    if (filters.postId && guard.currentDeploymentPostId !== filters.postId) return false;
    if (filters.minScore !== undefined && guard.meritScore < filters.minScore) return false;
    if (filters.maxScore !== undefined && guard.meritScore > filters.maxScore) return false;
    if (filters.certification && !guard.certifications?.includes(filters.certification)) return false;
    return true;
  });
}

/**
 * Export guards to CSV
 * @param guards - Guards to export
 * @returns CSV string
 */
export function exportGuardsToCSV(guards: Guard[]): string {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'ID Number',
    'Date of Hire',
    'Status',
    'Deployment Post',
    'Merit Score',
    'Certifications',
  ];

  const rows = guards.map((guard) => [
    guard.id,
    guard.name,
    guard.email,
    guard.phone,
    guard.idNumber,
    guard.dateOfHire,
    guard.status,
    guard.currentDeploymentPostId || 'N/A',
    guard.meritScore,
    guard.certifications?.join(';') || 'None',
  ]);

  return [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');
}

/**
 * Get available guards
 * @param guards - All guards
 * @returns Guards available for deployment
 */
export function getAvailableGuards(guards: Guard[]): Guard[] {
  return guards.filter(
    (g) => g.status === 'on_duty' || g.status === 'off_duty'
  );
}

/**
 * Calculate guard utilization
 * @param guards - All guards
 * @param posts - Total deployment posts
 * @returns Utilization percentage
 */
export function calculateGuardUtilization(guards: Guard[], posts: number = 1): number {
  const deployed = guards.filter((g) => g.currentDeploymentPostId).length;
  return posts > 0 ? Math.round((deployed / (guards.length * posts)) * 100) : 0;
}

/**
 * Get top performers
 * @param guards - All guards
 * @param limit - Number to return
 * @returns Top performers
 */
export function getTopPerformers(guards: Guard[], limit: number = 10): Guard[] {
  return guards.sort((a, b) => b.meritScore - a.meritScore).slice(0, limit);
}
