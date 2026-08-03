import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import ReportExportService from '../services/ReportExportService';
import * as db from '../db';

const reportService = ReportExportService.getInstance();

export const reportRouter = router({
  generatePayrollReport: protectedProcedure
    .input(
      z.object({
        cycleId: z.string(),
        format: z.enum(['pdf', 'excel', 'both']),
      })
    )
    .query(async ({ ctx, input }) => {
      const payrollData = await db.getPayrollBatch(input.cycleId);
      const report = await reportService.generatePayrollReport(input.cycleId, payrollData);

      // Store report for audit
      await db.logReportGenerated({
        userId: ctx.user.id,
        type: 'payroll',
        cycleId: input.cycleId,
        format: input.format,
        timestamp: new Date(),
      });

      return report;
    }),

  generateIncidentReport: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        format: z.enum(['pdf', 'excel', 'both']),
      })
    )
    .query(async ({ ctx, input }) => {
      const incidents = await db.getIncidentsInDateRange(
        new Date(input.startDate),
        new Date(input.endDate)
      );
      const report = await reportService.generateIncidentReport(
        new Date(input.startDate),
        new Date(input.endDate),
        incidents
      );

      // Store report for audit
      await db.logReportGenerated({
        userId: ctx.user.id,
        type: 'incident',
        format: input.format,
        timestamp: new Date(),
      });

      return report;
    }),

  generatePerformanceReport: protectedProcedure
    .input(
      z.object({
        timeRange: z.enum(['week', 'month', 'quarter', 'year']),
        format: z.enum(['pdf', 'excel', 'both']),
      })
    )
    .query(async ({ ctx, input }) => {
      const performanceData = await db.getPerformanceReport(input.timeRange);
      // Generate report using the data
      return { success: true, data: performanceData };
    }),
});
