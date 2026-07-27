import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import * as db from '../db';

export const notificationsRouter = router({
  subscribe: protectedProcedure
    .input(
      z.object({
        deviceToken: z.string(),
        platform: z.enum(['expo', 'fcm', 'apns']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.saveDeviceToken(ctx.user.id, input.deviceToken, input.platform);
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ deviceToken: z.string() }))
    .mutation(async ({ input }) => {
      return db.removeDeviceToken(input.deviceToken);
    }),

  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getNotificationPreferences(ctx.user.id);
    }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        incidents: z.boolean().optional(),
        payroll: z.boolean().optional(),
        shifts: z.boolean().optional(),
        alerts: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.updateNotificationPreferences(ctx.user.id, input);
    }),
});
