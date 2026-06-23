import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";
import { doctorApi } from "./slices/doctorApi";
import { notificationApi } from "./slices/notificationApi";
import { partnerApi } from "./slices/partnerApi";
import { languageApi, pushTokenApi } from "./slices/languageApi";
import { fulfillmentApi } from "./api/fulfillmentApi";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from "redux-persist";

const rootPersistConfig = {
  key: "root",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  [doctorApi.reducerPath]: doctorApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [partnerApi.reducerPath]: partnerApi.reducer,
  [languageApi.reducerPath]: languageApi.reducer,
  [pushTokenApi.reducerPath]: pushTokenApi.reducer,
  [fulfillmentApi.reducerPath]: fulfillmentApi.reducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(doctorApi.middleware)
      .concat(notificationApi.middleware)
      .concat(partnerApi.middleware)
      .concat(languageApi.middleware)
      .concat(pushTokenApi.middleware)
      .concat(fulfillmentApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;