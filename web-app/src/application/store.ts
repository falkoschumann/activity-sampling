// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { configureStore } from "@reduxjs/toolkit";
import { ActivitiesApi } from "../infrastructure/activities_api";
import { AuthenticationGateway } from "../infrastructure/authentication_gateway";
import { NotificationClient } from "../infrastructure/notification_client";
import { UserApi } from "../infrastructure/user_api";
import { Clock } from "../util/clock";
import { Timer } from "../util/timer";

import activitiesReducer from "./activities_slice";
import authenticationReducer from "./authentication_slice";

export const authenticationGateway = AuthenticationGateway.create();

export const store = createStore(
  ActivitiesApi.create(),
  UserApi.create(),
  NotificationClient.create(),
  Clock.create(),
  Timer.create(),
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function createStore(
  activitiesApi: ActivitiesApi,
  userApi: UserApi,
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
            userApi,
            notificationClient,
            clock,
            timer,
          },
        },
      }),
  });
}
