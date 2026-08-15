import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { detectDeviceLanguage, getLanguage } from "../configs/i18n";
import { store } from "../redux/store";
import { pushTokenApi } from "../redux/slices/languageApi";

function resolveExpoProjectId(): string | undefined {
  const easId = Constants.easConfig?.projectId;
  const extraId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)
    ?.eas?.projectId;
  return easId || extraId || undefined;
}

/**
 * Registers Expo push token when a valid EAS projectId is configured.
 * Skips silently when projectId is missing (honest MVP: no broken push).
 */
export async function registerPartnerPushToken(): Promise<void> {
  if (!Device.isDevice) return;

  const projectId = resolveExpoProjectId();
  if (!projectId) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;
    await store.dispatch(
      pushTokenApi.endpoints.registerPushToken.initiate({
        token,
        platform: Platform.OS,
        language: getLanguage() || detectDeviceLanguage(),
      }),
    );
  } catch {
    // Push registration is best-effort; do not block partner flows.
  }
}
