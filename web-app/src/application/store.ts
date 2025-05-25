// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { configureStore } from "@reduxjs/toolkit";

import { ActivitiesApi } from "../infrastructure/activities_api";
import { AuthenticationApi } from "../infrastructure/authentication_api";
import { NotificationClient } from "../infrastructure/notification_client";
import { Clock } from "../util/clock";
import { Timer } from "../util/timer";

import activitiesReducer from "./activities_slice";
import authenticationReducer from "./authentication_slice";

export const store = createStore(
  ActivitiesApi.create(),
  AuthenticationApi.create(),
  NotificationClient.create(),
  Clock.create(),
  Timer.create(),
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function createStore(
  activitiesApi: ActivitiesApi,
  authentication: AuthenticationApi,
  notificationClient: NotificationClient,
  clock: Clock,
  timer: Timer,
) {
  return configureStore({
    reducer: {
      activities: activitiesReducer,
      authentication: authenticationReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            activitiesApi,
            authentication,
            notificationClient,
            clock,
            timer,
          },
        },
      }),
  });
}
