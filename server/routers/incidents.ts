import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { incidents, InsertIncident } from '../../drizzle/schema';
import * as db from '../db';

const createIncidentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  location: z.string().min(1).max(255),
  reportedBy: z.string().min(1),
});

const updateIncidentSchema = z.object({
  id: z.number(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  assignedTo: z.string().optional(),
  resolution: z.string().optional(),
});

export const incidentsRouter = router({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getIncidents(ctx.user.id);
    }),

  stats: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getIncidentStats(ctx.user.id);
    }),

  create: protectedProcedure
    .input(createIncidentSchema)
    .mutation(async ({ ctx, input }) => {
      const incident: InsertIncident = {
        title: input.title,
        description: input.description,
        severity: input.severity,
        location: input.location,
        reportedBy: input.reportedBy,
        status: 'open',
        reportedAt: new Date(),
        createdBy: ctx.user.id,
      };
      return db.createIncident(incident);
    }),

  update: protectedProcedure
    .input(updateIncidentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const responseTime = updateData.status === 'in_progress'
        ? Math.floor((Date.now() - (await db.getIncident(id)).reportedAt.getTime()) / 60000)
        : undefined;

      return db.updateIncident(id, {
        ...updateData,
        responseTime,
        resolvedAt: updateData.status === 'resolved' ? new Date() : undefined,
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getIncident(input.id);
    }),
});
