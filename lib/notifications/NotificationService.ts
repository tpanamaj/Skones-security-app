import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { ThemedText } from '@/components/ThemedText';
import { View, StyleSheet } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPayload {
  type: 'incident' | 'payroll' | 'shift' | 'alert' | 'approval';
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'high' | 'normal';
}

class NotificationService {
  private static instance: NotificationService;
  private deviceToken: string | null = null;
  private notificationListeners: ((notification: Notifications.Notification) => void)[] = [];

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (!Device.isDevice) {
      console.warn('Notifications only work on physical devices');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;

    this.deviceToken = token;
    console.log('Push Token:', token);
  }

  getDeviceToken(): string | null {
    return this.deviceToken;
  }

  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        badge: 1,
        sound: 'default',
      },
      trigger: {
        seconds: 1,
      },
    });
  }

  async sendRemoteNotification(
    deviceToken: string,
    payload: NotificationPayload
  ): Promise<Response> {
    const message = {
      to: deviceToken,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      priority: payload.priority || 'high',
    };

    return fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  }

  addNotificationListener(listener: (notification: Notifications.Notification) => void): () => void {
    this.notificationListeners.push(listener);
    return () => {
      this.notificationListeners = this.notificationListeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(notification: Notifications.Notification): void {
    this.notificationListeners.forEach((listener) => listener(notification));
  }
}

export const useNotifications = () => {
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    notificationService.initialize();

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      setNotification(response.notification);
    });

    return () => subscription.remove();
  }, []);

  return {
    notification,
    sendLocalNotification: notificationService.sendLocalNotification.bind(notificationService),
    deviceToken: notificationService.getDeviceToken(),
  };
};

export default NotificationService;
