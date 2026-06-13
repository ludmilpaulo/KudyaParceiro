export const DEV_TEST_DOCTOR_LOGIN = {
  username: "doctor@kudya.shop",
  password: "seedpass123",
} as const;

export const DEV_TEST_LOGIN_BUTTON_LABEL = "Fill test doctor login";

export function isDevLoginEnabled(): boolean {
  return __DEV__;
}
