import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDeviceLanguage } from "../../services/api";
import { getBaseApiUrl } from "../../utils/apiClient";
import { loginUser, logoutUser } from "../slices/authSlice";

type AuthPayload = {
  token?: string;
  access?: string;
  access_token?: string;
  refresh?: string;
};

function tokenFromUser(user: AuthPayload | null | undefined): string | undefined {
  if (!user) return undefined;
  return user.token || user.access || user.access_token;
}

function readAuthFromStore(): { token?: string; refresh?: string; user?: AuthPayload } {
  try {
    // Lazy require avoids store ↔ RTK slice circular import at module load.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { store } = require("../store") as {
      store: { getState: () => { auth?: { user?: AuthPayload } } };
    };
    const user = store.getState().auth?.user;
    return { token: tokenFromUser(user), refresh: user?.refresh, user };
  } catch {
    return {};
  }
}

async function readAuthFromStorage(): Promise<{ token?: string; refresh?: string; user?: AuthPayload }> {
  try {
    const raw = await AsyncStorage.getItem("persist:root");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { auth?: string };
    const user = parsed.auth ? (JSON.parse(parsed.auth) as { user?: AuthPayload }).user : undefined;
    return { token: tokenFromUser(user), refresh: user?.refresh, user };
  } catch {
    return {};
  }
}

async function readAuthCredentials(): Promise<{ token?: string; refresh?: string; user?: AuthPayload }> {
  const fromStore = readAuthFromStore();
  if (fromStore.token) return fromStore;
  return readAuthFromStorage();
}

function applyAuthTokens(access: string, refresh?: string) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { store } = require("../store") as {
    store: {
      getState: () => { auth?: { user?: AuthPayload } };
      dispatch: (action: ReturnType<typeof loginUser> | ReturnType<typeof logoutUser>) => void;
    };
  };
  const user = store.getState().auth?.user;
  if (!user) return;
  store.dispatch(
    loginUser({
      ...user,
      access,
      token: access,
      access_token: access,
      ...(refresh ? { refresh } : {}),
    }),
  );
}

async function refreshSession(refresh: string): Promise<string | null> {
  try {
    const response = await fetch(`${getBaseApiUrl()}/api/auth/refresh/`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { access?: string; token?: string; refresh?: string };
    const access = data.access || data.token;
    if (!access) return null;
    applyAuthTokens(access, data.refresh || refresh);
    return access;
  } catch {
    return null;
  }
}

export function createApiBaseQuery(apiPath: string): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${getBaseApiUrl()}${apiPath}`,
    prepareHeaders: async (headers, { endpoint }) => {
      const isMultipartUpload =
        endpoint === "uploadDoctorDocument" ||
        endpoint === "uploadDriverPersonalDocument" ||
        endpoint === "uploadDriverVehicleDocument";
      if (!isMultipartUpload) {
        headers.set("Content-Type", "application/json");
      }
      headers.set("Accept-Language", getDeviceLanguage());
      const { token } = await readAuthCredentials();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);
    if (result.error?.status !== 401) return result;

    const { refresh } = await readAuthCredentials();
    if (!refresh) {
      api.dispatch(logoutUser());
      return result;
    }

    const access = await refreshSession(refresh);
    if (!access) {
      api.dispatch(logoutUser());
      return result;
    }

    return rawBaseQuery(args, api, extraOptions);
  };
}
