import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type AuthUser = {
  user_id: number;
  token: string;
  access_token?: string;
  access?: string;
  username?: string;
  role?: string;
  driver_service_modes?: string[];
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  user?: Record<string, unknown>;
};

type AuthState = {
  user: AuthUser | null;
};

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
    },
    setDriverServiceModes: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.driver_service_modes = action.payload;
      }
    },
  },
});

export const { loginUser, logoutUser, setDriverServiceModes } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;

export default authSlice.reducer;
