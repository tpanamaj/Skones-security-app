import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import ExternalAPIService from '../services/ExternalAPIService';
import * as db from '../db';

const apiService = ExternalAPIService.getInstance();

export const externalApisRouter = router({
  // Weather endpoints
  getWeather: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      return apiService.getWeatherData(input.latitude, input.longitude);
    }),

  // Traffic endpoints
  getTraffic: protectedProcedure
    .input(
      z.object({
        origin: z.string(),
        destination: z.string(),
      })
    )
    .query(async ({ input }) => {
      return apiService.getTrafficData(input.origin, input.destination);
    }),

  // Geolocation endpoints
  getGeolocation: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      return apiService.getGeolocation(input.latitude, input.longitude);
    }),

  reverseGeocodeLocation: protectedProcedure
    .input(
      z.object({
        address: z.string(),
      })
    )
    .query(async ({ input }) => {
      return apiService.reverseGeocode(input.address);
    }),

  // Distance Matrix
  calculateDistance: protectedProcedure
    .input(
      z.object({
        origins: z.array(z.string()),
        destinations: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      return apiService.calculateDistance(input.origins, input.destinations);
    }),

  // Location tracking for guards
  trackGuardLocation: protectedProcedure
    .input(
      z.object({
        guardId: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const geolocation = await apiService.getGeolocation(input.latitude, input.longitude);
      return db.recordGuardLocation(input.guardId, {
        latitude: input.latitude,
        longitude: input.longitude,
        address: geolocation.address,
        timestamp: new Date(),
      });
    }),

  // Get guard tracking history
  getGuardTrackingHistory: protectedProcedure
    .input(
      z.object({
        guardId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      return db.getGuardLocationHistory(
        input.guardId,
        new Date(input.startDate),
        new Date(input.endDate)
      );
    }),

  // Get guards near location
  getGuardsNearLocation: protectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      return db.getGuardsWithinRadius(input.latitude, input.longitude, input.radiusKm);
    }),

  // Weather conditions at guard location
  getWeatherAtGuardLocation: protectedProcedure
    .input(
      z.object({
        guardId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const location = await db.getGuardCurrentLocation(input.guardId);
      if (!location) {
        throw new Error('Guard location not found');
      }
      return apiService.getWeatherData(location.latitude, location.longitude);
    }),

  // Route optimization
  optimizeRoute: protectedProcedure
    .input(
      z.object({
        waypoints: z.array(
          z.object({
            latitude: z.number(),
            longitude: z.number(),
            name: z.string(),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      // Implement route optimization logic
      return { waypoints: input.waypoints, optimized: true };
    }),
});
