import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDeviceLanguage } from "../../services/api";
import { getBaseApiUrl } from "../../utils/apiClient";

type AuthPayload = {
  token?: string;
  access?: string;
  access_token?: string;
};

function tokenFromUser(user: AuthPayload | null | undefined): string | undefined {
  if (!user) return undefined;
  return user.token || user.access || user.access_token;
}

function readAuthTokenFromStore(): string | undefined {
  try {
    // Lazy require avoids store ↔ RTK slice circular import at module load.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { store } = require("../store") as {
      store: { getState: () => { auth?: { user?: AuthPayload } } };
    };
    return tokenFromUser(store.getState().auth?.user);
  } catch {
    return undefined;
  }
}

async function readAuthToken(): Promise<string | undefined> {
  const fromStore = readAuthTokenFromStore();
  if (fromStore) return fromStore;

  try {
    const raw = await AsyncStorage.getItem("persist:root");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { auth?: string };
    const auth = parsed.auth ? (JSON.parse(parsed.auth) as { user?: AuthPayload }) : undefined;
    return tokenFromUser(auth?.user);
  } catch {
    return undefined;
  }
}

export function createApiBaseQuery(apiPath: string) {
  return fetchBaseQuery({
    baseUrl: `${getBaseApiUrl()}${apiPath}`,
    prepareHeaders: async (headers, { endpoint }) => {
      const isUpload = endpoint === "uploadDoctorDocument";
      if (!isUpload) {
        headers.set("Content-Type", "application/json");
      }
      headers.set("Accept-Language", getDeviceLanguage());
      const token = await readAuthToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  });
}
