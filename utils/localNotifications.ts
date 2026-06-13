import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Remote/local push via expo-notifications is unavailable in Android Expo Go (SDK 53+). */
export const canUseLocalNotifications = (): boolean =>
  !(Constants.appOwnership === 'expo' && Platform.OS === 'android');

type NotificationContent = {
  title: string;
  body: string;
  sound?: boolean;
};

let handlerConfigured = false;

async function loadNotifications() {
  if (!canUseLocalNotifications()) {
    return null;
  }
  return import('expo-notifications');
}

export async function configureNotificationHandler(): Promise<void> {
  if (!canUseLocalNotifications() || handlerConfigured) {
    return;
  }
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerConfigured = true;
}

export async function scheduleLocalNotification(content: NotificationContent): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: content.sound ?? true,
    },
    trigger: null,
  });
}

export async function registerForPushNotificationsAsync(projectId: string): Promise<string | null> {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  return token;
}
