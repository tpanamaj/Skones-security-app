import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import * as db from '../db';

export const auditRouter = router({
  getLogs: protectedProcedure
    .input(
      z.object({
        filters: z
          .object({
            module: z.string().optional(),
            action: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return db.getAuditLogs(ctx.user.id, input.filters);
    }),

  getSummary: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getAuditSummary(ctx.user.id);
    }),

  log: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        module: z.string(),
        details: z.string().optional(),
        status: z.enum(['success', 'failure']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.createAuditLog({
        action: input.action,
        module: input.module,
        userId: ctx.user.id,
        details: input.details,
        status: input.status,
        timestamp: new Date(),
      });
    }),
});
