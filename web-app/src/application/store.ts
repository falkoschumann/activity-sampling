// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

import { Clock } from "../common/clock";
import { Timer } from "../common/timer";
import { ActivitiesApi } from "../infrastructure/activities_api";
import { AuthenticationApi } from "../infrastructure/authentication_api";
import { NotificationClient } from "../infrastructure/notification_client";
import authenticationReducer from "./authentication_slice";
import logReducer from "./log_slice";
import reportsReducer from "./reports_slice";
import timesheetReducer from "./timesheet_slice";

export const store = createStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export function createStore({
  activitiesApi = ActivitiesApi.create(),
  authenticationApi = AuthenticationApi.create(),
  notificationClient = NotificationClient.create(),
  clock = Clock.create(),
  timer = Timer.create(),
}: {
  activitiesApi?: ActivitiesApi;
  authenticationApi?: AuthenticationApi;
  notificationClient?: NotificationClient;
  clock?: Clock;
  timer?: Timer;
} = {}) {
  return configureStore({
    reducer: {
      log: logReducer,
      reports: reportsReducer,
      timesheet: timesheetReducer,
      authentication: authenticationReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            activitiesApi,
            authenticationApi,
            notificationClient,
            clock,
            timer,
          },
        },
      }),
  });
}

export function createNullStore({
  activitiesResponses,
  authenticationResponses,
  fixedDate,
}: {
  activitiesResponses?: Response | Response[];
  authenticationResponses?: Response | Response[];
  fixedDate?: Date | string;
} = {}) {
  const activitiesApi = ActivitiesApi.createNull(activitiesResponses);
  const authenticationApi = AuthenticationApi.createNull(
    authenticationResponses,
  );
  const notificationClient = NotificationClient.createNull();
  const clock = Clock.createNull(fixedDate);
  const timer = Timer.createNull();
  const store = createStore({
    activitiesApi,
    authenticationApi,
    notificationClient,
    clock,
    timer,
  });
  return { store, activitiesApi, notificationClient, clock, timer };
}
