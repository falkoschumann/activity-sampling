// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { configureStore } from "@reduxjs/toolkit";
import { Clock } from "../common/clock";
import { Timer } from "../common/timer";

import { ActivitiesApi } from "../infrastructure/activities_api";
import { AuthenticationApi } from "../infrastructure/authentication_api";
import { NotificationClient } from "../infrastructure/notification_client";
import activitiesReducer from "./activities_slice";
import authenticationReducer from "./authentication_slice";
import timesheetReducer from "./timesheet_slice";

export const store = createStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

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
      activities: activitiesReducer,
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
