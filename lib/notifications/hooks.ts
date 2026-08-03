import { trpc } from '@/lib/trpc';
import NotificationService, { NotificationPayload } from './NotificationService';

const notificationService = NotificationService.getInstance();

export const useNotificationSubscription = () => {
  const { mutate: subscribeToNotifications } = trpc.notifications.subscribe.useMutation();

  const subscribe = async () => {
    const deviceToken = notificationService.getDeviceToken();
    if (deviceToken) {
      subscribeToNotifications({
        deviceToken,
        platform: 'expo',
      });
    }
  };

  return { subscribe };
};

export const useIncidentAlerts = () => {
  const { data: incidents } = trpc.incidents.list.useQuery();

  const sendIncidentAlert = async (incident: any) => {
    const payload: NotificationPayload = {
      type: 'incident',
      title: `${incident.severity.toUpperCase()} Incident`,
      body: incident.title,
      data: {
        incidentId: incident.id,
        severity: incident.severity,
      },
      priority: incident.severity === 'critical' ? 'high' : 'normal',
    };

    await notificationService.sendLocalNotification(payload);
  };

  return { sendIncidentAlert, incidents };
};

export const usePayrollNotifications = () => {
  const sendPayrollNotification = async (type: 'submitted' | 'approved' | 'paid') => {
    const titles = {
      submitted: 'Payroll Submitted',
      approved: 'Payroll Approved',
      paid: 'Payment Processed',
    };

    const payload: NotificationPayload = {
      type: 'payroll',
      title: titles[type],
      body: `Payroll cycle has been ${type}`,
      data: { type },
    };

    await notificationService.sendLocalNotification(payload);
  };

  return { sendPayrollNotification };
};

export const useShiftNotifications = () => {
  const sendShiftNotification = async (guardName: string, postName: string) => {
    const payload: NotificationPayload = {
      type: 'shift',
      title: 'Shift Assigned',
      body: `${guardName} assigned to ${postName}`,
      data: { guardName, postName },
    };

    await notificationService.sendLocalNotification(payload);
  };

  return { sendShiftNotification };
};
