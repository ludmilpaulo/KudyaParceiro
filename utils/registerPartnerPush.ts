import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { detectDeviceLanguage, getLanguage } from "../configs/i18n";
import { store } from "../redux/store";
import { pushTokenApi } from "../redux/slices/languageApi";

export async function registerPartnerPushToken(): Promise<void> {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  const projectId =
    Notifications.getExpoPushTokenAsync.length > 0
      ? undefined
      : undefined;

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResponse.data;
    await store.dispatch(
      pushTokenApi.endpoints.registerPushToken.initiate({
        token,
        platform: Platform.OS,
        language: getLanguage() || detectDeviceLanguage(),
      }),
    );
  } catch {
    // Push registration is best-effort on dev builds.
  }
}
