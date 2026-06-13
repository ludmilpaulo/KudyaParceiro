import { apiFetch, parseApiResponse } from '../utils/apiClient';
import {
  normalizeAuthResponse,
  AuthSessionPayload,
  DriverServiceMode,
} from './authTypes';
import { loginUserService } from './authService';

export type PartnerSignupData = {
  username: string;
  email: string;
  password: string;
  businessName: string;
  phone: string;
  address: string;
  business_category: string;
  logo?: { uri: string; type: string; name: string };
  store_license?: { uri: string; type: string; name: string };
};

export type DriverSignupData = {
  username: string;
  email: string;
  password: string;
  service_modes: DriverServiceMode[];
};

async function finalizeSignup(
  username: string,
  password: string,
  raw: Record<string, unknown>,
): Promise<AuthSessionPayload> {
  if (raw.access || raw.token) {
    return normalizeAuthResponse(raw);
  }
  return loginUserService(username, password);
}

export async function signupPartner(data: PartnerSignupData): Promise<AuthSessionPayload> {
  const formData = new FormData();
  formData.append('username', data.username);
  formData.append('email', data.email);
  formData.append('password', data.password);
  formData.append('name', data.businessName);
  formData.append('phone', data.phone);
  formData.append('address', data.address);
  formData.append('business_category', data.business_category);

  if (data.logo) {
    formData.append('logo', {
      uri: data.logo.uri,
      type: data.logo.type,
      name: data.logo.name,
    } as unknown as Blob);
  }
  if (data.store_license) {
    formData.append('store_license', {
      uri: data.store_license.uri,
      type: data.store_license.type,
      name: data.store_license.name,
    } as unknown as Blob);
  }

  const response = await apiFetch('/store/fornecedor/', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
    timeoutMs: 60000,
  });

  const responseData = await parseApiResponse<Record<string, unknown>>(response);
  return finalizeSignup(data.username, data.password, responseData);
}

export async function signupDriver(data: DriverSignupData): Promise<AuthSessionPayload> {
  const response = await apiFetch('/driver/signup/driver/', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: data.username,
      email: data.email,
      password: data.password,
      password2: data.password,
      service_modes: data.service_modes,
    }),
  });

  const responseData = await parseApiResponse<Record<string, unknown>>(response);
  return finalizeSignup(data.username, data.password, responseData);
}
