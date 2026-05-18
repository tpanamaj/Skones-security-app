import { Incident, IncidentType, IncidentSeverity, IncidentStatus } from './types';

/**
 * Incident Management System
 * Handles incident reporting, tracking, and analytics
 */

/**
 * Create new incident
 * @param type - Incident type
 * @param description - Description
 * @param location - Location
 * @param reportedBy - Reporter ID
 * @param severity - Severity level
 * @returns New incident
 */
export function createIncident(
  type: IncidentType,
  description: string,
  location: string,
  reportedBy: string,
  severity: IncidentSeverity = 'medium'
): Incident {
  if (!description || description.trim() === '') {
    throw new Error('Description is required');
  }

  return {
    id: `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    description,
    location,
    dateTime: new Date().toISOString(),
    reportedBy,
    guardIds: [],
    severity,
    status: 'reported',
    photos: [],
    attachments: [],
    timeline: [
      {
        timestamp: new Date().toISOString(),
        updatedBy: reportedBy,
        status: 'reported',
        notes: 'Incident reported',
      },
    ],
  };
}

/**
 * Update incident status
 * @param incident - Incident to update
 * @param newStatus - New status
 * @param updatedBy - Updated by (user ID)
 * @param notes - Status update notes
 * @returns Updated incident
 */
export function updateIncidentStatus(
  incident: Incident,
  newStatus: IncidentStatus,
  updatedBy: string,
  notes: string
): Incident {
  const updated = { ...incident, status: newStatus };

  if (newStatus === 'resolved' || newStatus === 'closed') {
    updated.resolvedDate = new Date().toISOString();
  }

  updated.timeline = [
    {
      timestamp: new Date().toISOString(),
      updatedBy,
      status: newStatus,
      notes,
    },
    ...incident.timeline,
  ];

  return updated;
}

/**
 * Add photo to incident
 * @param incident - Incident
 * @param photoUrl - Photo URL
 * @returns Updated incident
 */
export function addPhotoToIncident(incident: Incident, photoUrl: string): Incident {
  return {
    ...incident,
    photos: [...incident.photos, photoUrl],
  };
}

/**
 * Add attachment to incident
 * @param incident - Incident
 * @param attachmentUrl - Attachment URL
 * @returns Updated incident
 */
export function addAttachmentToIncident(incident: Incident, attachmentUrl: string): Incident {
  return {
    ...incident,
    attachments: [...incident.attachments, attachmentUrl],
  };
}

/**
 * Get severity badge
 * @param severity - Severity level
 * @returns Badge information
 */
export function getSeverityBadge(severity: IncidentSeverity) {
  const badges: Record<IncidentSeverity, any> = {
    low: { color: 'green', icon: '🟢', level: 'Low Priority' },
    medium: { color: 'yellow', icon: '🟡', level: 'Medium Priority' },
    high: { color: 'orange', icon: '🟠', level: 'High Priority' },
    critical: { color: 'red', icon: '🔴', level: 'Critical' },
  };

  return badges[severity];
}

/**
 * Calculate resolution time
 * @param incident - Incident
 * @returns Resolution time in hours
 */
export function getResolutionTime(incident: Incident): number | null {
  if (!incident.resolvedDate) return null;

  const reported = new Date(incident.dateTime).getTime();
  const resolved = new Date(incident.resolvedDate).getTime();

  return Math.round((resolved - reported) / (1000 * 60 * 60));
}

/**
 * Filter incidents
 * @param incidents - Incidents array
 * @param criteria - Filter criteria
 * @returns Filtered incidents
 */
export function filterIncidents(
  incidents: Incident[],
  criteria: {
    type?: IncidentType;
    severity?: IncidentSeverity;
    status?: IncidentStatus;
    startDate?: string;
    endDate?: string;
    location?: string;
    searchText?: string;
  }
): Incident[] {
  return incidents.filter((incident) => {
    if (criteria.type && incident.type !== criteria.type) return false;

    if (criteria.severity && incident.severity !== criteria.severity) return false;

    if (criteria.status && incident.status !== criteria.status) return false;

    if (criteria.startDate && new Date(incident.dateTime) < new Date(criteria.startDate)) {
      return false;
    }

    if (criteria.endDate && new Date(incident.dateTime) > new Date(criteria.endDate)) {
      return false;
    }

    if (criteria.location && !incident.location.toLowerCase().includes(criteria.location.toLowerCase())) {
      return false;
    }

    if (criteria.searchText) {
      const search = criteria.searchText.toLowerCase();
      if (!incident.description.toLowerCase().includes(search) && !incident.location.toLowerCase().includes(search)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get incident statistics
 * @param incidents - Incidents array
 * @returns Statistics
 */
export function getIncidentStats(incidents: Incident[]) {
  const stats: any = {
    total: incidents.length,
    byType: {},
    bySeverity: {},
    byStatus: {},
    avgResolutionTime: 0,
  };

  // Count by type
  const typeCount: Record<string, number> = {};
  incidents.forEach((inc) => {
    typeCount[inc.type] = (typeCount[inc.type] || 0) + 1;
  });
  stats.byType = typeCount;

  // Count by severity
  const severityCount: Record<string, number> = {};
  incidents.forEach((inc) => {
    severityCount[inc.severity] = (severityCount[inc.severity] || 0) + 1;
  });
  stats.bySeverity = severityCount;

  // Count by status
  const statusCount: Record<string, number> = {};
  incidents.forEach((inc) => {
    statusCount[inc.status] = (statusCount[inc.status] || 0) + 1;
  });
  stats.byStatus = statusCount;

  // Average resolution time
  const resolvedIncidents = incidents.filter((inc) => inc.resolvedDate);
  if (resolvedIncidents.length > 0) {
    const times = resolvedIncidents.map((inc) => getResolutionTime(inc) || 0);
    stats.avgResolutionTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }

  return stats;
}

/**
 * Get critical incidents
 * @param incidents - Incidents array
 * @returns Critical incidents (unresolved high/critical severity)
 */
export function getCriticalIncidents(incidents: Incident[]): Incident[] {
  return incidents.filter(
    (inc) =>
      (inc.severity === 'critical' || inc.severity === 'high') &&
      (inc.status === 'reported' || inc.status === 'investigating')
  );
}

/**
 * Generate incident report
 * @param incidents - Incidents array
 * @param startDate - Start date (optional)
 * @param endDate - End date (optional)
 * @returns Report
 */
export function generateIncidentReport(
  incidents: Incident[],
  startDate?: string,
  endDate?: string
) {
  let filtered = incidents;

  if (startDate) {
    filtered = filtered.filter((inc) => new Date(inc.dateTime) >= new Date(startDate));
  }

  if (endDate) {
    filtered = filtered.filter((inc) => new Date(inc.dateTime) <= new Date(endDate));
  }

  const stats = getIncidentStats(filtered);
  const critical = getCriticalIncidents(filtered);

  return {
    reportDate: new Date().toISOString(),
    period: { startDate, endDate },
    statistics: stats,
    criticalCount: critical.length,
    criticalIncidents: critical,
    topLocations: getTopIncidentLocations(filtered),
    resolutionMetrics: {
      resolved: filtered.filter((inc) => inc.status === 'resolved' || inc.status === 'closed').length,
      investigating: filtered.filter((inc) => inc.status === 'investigating').length,
      pending: filtered.filter((inc) => inc.status === 'reported').length,
      avgResolutionHours: stats.avgResolutionTime,
    },
  };
}

/**
 * Export incidents to CSV
 * @param incidents - Incidents array
 * @returns CSV string
 */
export function exportIncidentsToCSV(incidents: Incident[]): string {
  const headers = [
    'Incident ID',
    'Type',
    'Severity',
    'Status',
    'Location',
    'Description',
    'Date & Time',
    'Reported By',
    'Guard Count',
    'Photos',
    'Attachments',
    'Resolution Time (hrs)',
    'Resolved Date',
  ];

  const rows = incidents.map((inc) => [
    inc.id,
    inc.type,
    inc.severity,
    inc.status,
    inc.location,
    inc.description.substring(0, 50),
    new Date(inc.dateTime).toLocaleString(),
    inc.reportedBy,
    inc.guardIds.length,
    inc.photos.length,
    inc.attachments.length,
    getResolutionTime(inc) || '',
    inc.resolvedDate ? new Date(inc.resolvedDate).toLocaleString() : '',
  ]).map((row) => row.map((cell) => `"${cell}"`).join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Assign guards to incident
 * @param incident - Incident
 * @param guardIds - Guard IDs to assign
 * @returns Updated incident
 */
export function assignGuardsToIncident(incident: Incident, guardIds: string[]): Incident {
  return {
    ...incident,
    guardIds: [...new Set([...incident.guardIds, ...guardIds])],
  };
}

/**
 * Get incident trends
 * @param incidents - Incidents array
 * @param days - Number of days to analyze (default 30)
 * @returns Trend data
 */
export function getIncidentTrend(incidents: Incident[], days: number = 30) {
  const trends: any = {};

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];

    const dayIncidents = incidents.filter((inc) => inc.dateTime.split('T')[0] === dateKey);
    trends[dateKey] = {
      total: dayIncidents.length,
      critical: dayIncidents.filter((inc) => inc.severity === 'critical').length,
      high: dayIncidents.filter((inc) => inc.severity === 'high').length,
    };
  }

  return trends;
}

/**
 * Get top incident locations
 * @param incidents - Incidents array
 * @param limit - Top N locations (default 5)
 * @returns Top locations
 */
function getTopIncidentLocations(incidents: Incident[], limit: number = 5) {
  const locationCount = new Map<string, number>();

  incidents.forEach((inc) => {
    locationCount.set(inc.location, (locationCount.get(inc.location) || 0) + 1);
  });

  return Array.from(locationCount.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
