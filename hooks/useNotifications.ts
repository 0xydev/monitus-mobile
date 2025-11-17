import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { authService } from '@/services/api/auth';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // Update FCM token on backend
        updateFcmToken(token);
      }
    });

    // Listen for notifications when app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notif) => {
        setNotification(notif);
      });

    // Listen for notification interactions
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification response:', response);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const updateFcmToken = async (token: string) => {
    try {
      await authService.updateFcmToken(token);
    } catch {
      // Silently fail - token update is not critical
    }
  };

  return {
    expoPushToken,
    notification,
  };
}

async function registerForPushNotifications(): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return undefined;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // This will be set in app.json
      });
      token = tokenData.data;
    } catch (error) {
      console.log('Error getting push token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function scheduleTimerNotification(
  title: string,
  body: string,
  seconds: number
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      seconds,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
