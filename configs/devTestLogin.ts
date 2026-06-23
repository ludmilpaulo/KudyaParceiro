export const DEV_TEST_DOCTOR_LOGIN = {
  username: "doctor@kudya.shop",
  password: "seedpass123",
} as const;

export const DEV_TEST_STORE_LOGIN = {
  username: "store@kudya.shop",
  password: "seedpass123",
} as const;

export const DEV_TEST_DOCTOR_LOGIN_BUTTON_LABEL = "Fill test doctor login";
export const DEV_TEST_STORE_LOGIN_BUTTON_LABEL = "Fill test store login";

export function isDevLoginEnabled(): boolean {
  return __DEV__;
}
