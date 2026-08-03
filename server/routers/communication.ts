import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import CommunicationService from '../services/CommunicationService';
import * as db from '../db';

const communicationService = CommunicationService.getInstance();

const sendNotificationSchema = z.object({
  type: z.enum(['incident', 'payroll', 'shift', 'custom']),
  recipients: z.array(
    z.object({
      type: z.enum(['sms', 'email']),
      value: z.string(),
    })
  ),
  data: z.record(z.any()),
});

export const communicationRouter = router({
  sendNotification: protectedProcedure
    .input(sendNotificationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        switch (input.type) {
          case 'incident':
            await communicationService.sendIncidentAlert(input.recipients, input.data);
            break;
          case 'payroll':
            await communicationService.sendPayrollNotification(input.recipients, input.data);
            break;
          case 'shift':
            await communicationService.sendShiftNotification(input.recipients, input.data);
            break;
        }

        // Log notification for audit
        await db.logNotificationSent({
          userId: ctx.user.id,
          type: input.type,
          recipientCount: input.recipients.length,
          timestamp: new Date(),
        });

        return { success: true };
      } catch (error) {
        console.error('Failed to send notification:', error);
        throw error;
      }
    }),

  getNotificationPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      return db.getNotificationPreferences(ctx.user.id);
    }),

  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        smsEnabled: z.boolean().optional(),
        emailEnabled: z.boolean().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.updateNotificationPreferences(ctx.user.id, input);
    }),
});
