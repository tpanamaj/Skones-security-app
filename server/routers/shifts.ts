import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import * as db from '../db';

const createShiftSchema = z.object({
  guardId: z.string(),
  postId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  type: z.enum(['day', 'night', 'rotating']),
});

export const shiftsRouter = router({
  getSchedule: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      return db.getShiftSchedule(new Date(input.startDate), new Date(input.endDate));
    }),

  getAvailableGuards: protectedProcedure
    .query(async () => {
      return db.getAvailableGuards();
    }),

  getPosts: protectedProcedure
    .query(async () => {
      return db.getDeploymentPosts();
    }),

  createShift: protectedProcedure
    .input(createShiftSchema)
    .mutation(async ({ ctx, input }) => {
      return db.createShift({
        guardId: input.guardId,
        postId: input.postId,
        startDate: input.startDate,
        endDate: input.endDate,
        type: input.type,
        createdBy: ctx.user.id,
      });
    }),

  updateShift: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['scheduled', 'active', 'completed', 'cancelled']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db.updateShift(input.id, { status: input.status });
    }),
});
