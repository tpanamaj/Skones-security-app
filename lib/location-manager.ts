import { GuardLocation, DeploymentPost } from './types';

/**
 * Location Management System
 * Handles GPS tracking, geofencing, and location analytics
 */

/**
 * Add location update
 * @param guardId - Guard ID
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @param accuracy - Accuracy in meters
 * @param speed - Speed in km/h
 * @returns Location record
 */
export function addLocationUpdate(
  guardId: string,
  latitude: number,
  longitude: number,
  accuracy?: number,
  speed?: number
): GuardLocation {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error('Invalid coordinates');
  }

  return {
    guardId,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
    accuracy,
    speed,
  };
}

/**
 * Calculate distance between two points (Haversine formula)
 * @param lat1 - Latitude 1
 * @param lon1 - Longitude 1
 * @param lat2 - Latitude 2
 * @param lon2 - Longitude 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Detect location anomalies
 * @param locations - Location history
 * @returns Anomalies detected
 */
export function detectAnomalies(locations: GuardLocation[]) {
  const anomalies: any[] = [];

  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];

    // Check speed anomaly
    if (curr.speed && curr.speed > 100) {
      anomalies.push({
        type: 'extreme_speed',
        speed: curr.speed,
        location: `${curr.latitude}, ${curr.longitude}`,
        timestamp: curr.timestamp,
      });
    }

    // Check distance anomaly (teleportation)
    const dist = calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    const timeDiff = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / (1000 * 60 * 60);

    if (timeDiff > 0) {
      const impliedSpeed = dist / timeDiff;
      if (impliedSpeed > 80) {
        anomalies.push({
          type: 'unusual_jump',
          distance: Math.round(dist * 100) / 100,
          timeHours: timeDiff,
          impliedSpeed: Math.round(impliedSpeed * 100) / 100,
          timestamp: curr.timestamp,
        });
      }
    }
  }

  return anomalies;
}

/**
 * Check if location is within geofence
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @param fence - Geofence (center + radius)
 * @returns Is within fence
 */
export function isWithinGeofence(
  latitude: number,
  longitude: number,
  fence: { latitude: number; longitude: number; radiusKm: number }
): boolean {
  const distance = calculateDistance(latitude, longitude, fence.latitude, fence.longitude);
  return distance <= fence.radiusKm;
}

/**
 * Calculate route distance
 * @param locations - Location history (ordered by time)
 * @returns Total distance in km
 */
export function getRouteDistance(locations: GuardLocation[]): number {
  if (locations.length < 2) return 0;

  let totalDistance = 0;

  for (let i = 1; i < locations.length; i++) {
    const prev = locations[i - 1];
    const curr = locations[i];

    const distance = calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    totalDistance += distance;
  }

  return Math.round(totalDistance * 100) / 100;
}

/**
 * Generate location heatmap
 * @param locations - Location history
 * @param gridSize - Grid cell size in km (default 1)
 * @returns Heatmap grid
 */
export function getLocationHeatmap(locations: GuardLocation[], gridSize: number = 1) {
  if (locations.length === 0) return [];

  const grid = new Map<string, number>();

  locations.forEach((loc) => {
    const gridX = Math.floor(loc.latitude / gridSize);
    const gridY = Math.floor(loc.longitude / gridSize);
    const key = `${gridX},${gridY}`;

    grid.set(key, (grid.get(key) || 0) + 1);
  });

  return Array.from(grid.entries()).map(([key, count]) => {
    const [gridX, gridY] = key.split(',').map(Number);
    return {
      latitude: gridX * gridSize,
      longitude: gridY * gridSize,
      intensity: count,
      percentage: Math.round((count / locations.length) * 100),
    };
  });
}

/**
 * Validate guard is in post zone
 * @param guardLocation - Guard location
 * @param post - Deployment post
 * @param toleranceKm - Tolerance in km (default 1)
 * @returns Is within post zone
 */
export function validateGuardInZone(
  guardLocation: GuardLocation,
  post: DeploymentPost,
  toleranceKm: number = 1
): boolean {
  return isWithinGeofence(guardLocation.latitude, guardLocation.longitude, {
    latitude: post.latitude,
    longitude: post.longitude,
    radiusKm: toleranceKm,
  });
}

/**
 * Get location statistics
 * @param locations - Location history
 * @returns Statistics
 */
export function getLocationStats(locations: GuardLocation[]) {
  if (locations.length === 0) {
    return {
      totalLocations: 0,
      totalDistance: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      coverage: 0,
    };
  }

  const distances = locations
    .map((loc) => loc.speed || 0)
    .filter((speed) => speed > 0);

  return {
    totalLocations: locations.length,
    totalDistance: getRouteDistance(locations),
    avgSpeed: distances.length > 0 ? Math.round(distances.reduce((a, b) => a + b, 0) / distances.length * 100) / 100 : 0,
    maxSpeed: distances.length > 0 ? Math.max(...distances) : 0,
    coverage: getLocationHeatmap(locations).length,
    timeSpan: {
      start: locations[0]?.timestamp,
      end: locations[locations.length - 1]?.timestamp,
    },
  };
}

/**
 * Export location to GeoJSON
 * @param locations - Location history
 * @returns GeoJSON string
 */
export function exportLocationGeoJSON(locations: GuardLocation[]): string {
  const features = locations.map((loc) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [loc.longitude, loc.latitude],
    },
    properties: {
      timestamp: loc.timestamp,
      accuracy: loc.accuracy,
      speed: loc.speed,
    },
  }));

  return JSON.stringify({
    type: 'FeatureCollection',
    features,
  });
}

/**
 * Check patrol compliance
 * @param locations - Guard locations
 * @param requiredPosts - Required deployment posts
 * @param toleranceKm - Zone tolerance
 * @returns Compliance report
 */
export function checkPatrolCompliance(
  locations: GuardLocation[],
  requiredPosts: DeploymentPost[],
  toleranceKm: number = 1
) {
  const visited = new Set<string>();
  let totalTime = 0;

  locations.forEach((loc) => {
    requiredPosts.forEach((post) => {
      if (validateGuardInZone(loc, post, toleranceKm)) {
        visited.add(post.id);
      }
    });
  });

  if (locations.length > 1) {
    totalTime = (new Date(locations[locations.length - 1].timestamp).getTime() - new Date(locations[0].timestamp).getTime()) / (1000 * 60 * 60);
  }

  return {
    requiredPosts: requiredPosts.length,
    visitedPosts: visited.size,
    complianceRate: requiredPosts.length > 0 ? Math.round((visited.size / requiredPosts.length) * 100) : 0,
    patrolDurationHours: Math.round(totalTime * 10) / 10,
    distance: getRouteDistance(locations),
  };
}

/**
 * Generate movement report
 * @param locations - Location history
 * @returns Movement analysis
 */
export function generateMovementReport(locations: GuardLocation[]) {
  return {
    reportDate: new Date().toISOString(),
    stats: getLocationStats(locations),
    anomalies: detectAnomalies(locations),
    heatmap: getLocationHeatmap(locations),
    distance: getRouteDistance(locations),
  };
}
