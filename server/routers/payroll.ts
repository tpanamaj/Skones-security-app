import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import * as db from '../db';

const approvePayrollSchema = z.object({ cycleId: z.string() });
const processBatchSchema = z.object({ cycleId: z.string() });

export const payrollRouter = router({
  getCycles: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getPayrollCycles(ctx.user.id);
    }),

  getBatch: protectedProcedure
    .input(z.object({ cycleId: z.string() }))
    .query(async ({ input }) => {
      return db.getPayrollBatch(input.cycleId);
    }),

  approveCycle: protectedProcedure
    .input(approvePayrollSchema)
    .mutation(async ({ ctx, input }) => {
      return db.approvePayrollCycle(input.cycleId, ctx.user.id);
    }),

  processBatch: protectedProcedure
    .input(processBatchSchema)
    .mutation(async ({ ctx, input }) => {
      return db.processPayrollBatch(input.cycleId, ctx.user.id);
    }),

  calculateDeductions: protectedProcedure
    .input(
      z.object({
        guardId: z.string(),
        baseSalary: z.number(),
      })
    )
    .query(async ({ input }) => {
      return db.calculatePayrollDeductions(input.guardId, input.baseSalary);
    }),
});
