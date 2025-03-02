// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { configureStore } from "@reduxjs/toolkit";

import activitiesReducer from "./activities_slice";
import { ActivitiesApi } from "../infrastructure/activities_api.ts";
import { Clock } from "../util/clock.ts";
import { Timer } from "../util/timer.ts";

export const store = createStore(
  ActivitiesApi.create(),
  Clock.create(),
  Timer.create(),
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function createStore(
  activitiesApi: ActivitiesApi,
  clock: Clock,
  timer: Timer,
) {
  return configureStore({
    reducer: {
      activities: activitiesReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { activitiesApi, clock, timer },
        },
      }),
  });
}
