import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import * as db from '../db';

export const performanceRouter = router({
  getGuardMetrics: protectedProcedure
    .input(
      z.object({
        guardId: z.string(),
        timeRange: z.enum(['week', 'month', 'quarter', 'year']),
      })
    )
    .query(async ({ input }) => {
      return db.getGuardPerformanceMetrics(input.guardId, input.timeRange);
    }),

  getLeaderboard: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return db.getPerformanceLeaderboard(input.limit);
    }),

  getTrends: protectedProcedure
    .input(z.object({ guardId: z.string() }))
    .query(async ({ input }) => {
      return db.getPerformanceTrends(input.guardId);
    }),

  updateMetrics: protectedProcedure
    .input(
      z.object({
        guardId: z.string(),
        attendance: z.number().optional(),
        conduct: z.number().optional(),
        training: z.number().optional(),
        punctuality: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db.updateGuardPerformanceMetrics(input.guardId, input);
    }),
});
