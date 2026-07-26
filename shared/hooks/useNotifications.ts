import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

try {
  if (!isExpoGo) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (e) {
  console.warn('Notifications handler init skipped in Expo Go');
}

export function useNotifications() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (isExpoGo) return;

    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
      });
    } catch (e) {
      console.warn('Failed to add notification listeners in Expo Go:', e);
    }

    return () => {
      try {
        if (notificationListener.current?.remove) {
          notificationListener.current.remove();
        }
        if (responseListener.current?.remove) {
          responseListener.current.remove();
        }
      } catch (e) {}
    };
  }, []);

  return {
    scheduleDailyReminder: async (hour: number = 19, minute: number = 0) => {
      if (isExpoGo) {
        console.log('Daily reminder scheduled (simulated in Expo Go)');
        return true;
      }

      try {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return false;

        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Don't lose your streak!",
            body: 'Practice now and keep your daily streak alive!',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });

        return true;
      } catch (e) {
        console.warn('Schedule notification error:', e);
        return false;
      }
    },
  };
}

async function requestPermissions(): Promise<boolean> {
  if (isExpoGo) return true;

  try {
    const permissions = (await Notifications.getPermissionsAsync()) as any;
    let isGranted = permissions.granted || permissions.status === 'granted';

    if (!isGranted) {
      const requested = (await Notifications.requestPermissionsAsync()) as any;
      isGranted = requested.granted || requested.status === 'granted';
    }

    if (!isGranted) {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
      });
    }

    return true;
  } catch (e) {
    console.warn('Notification permission error:', e);
    return false;
  }
}
