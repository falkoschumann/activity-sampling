// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { configureStore } from "@reduxjs/toolkit";

import activitiesReducer from "./activities_slice";
import { ActivitiesApi } from "../infrastructure/activities_api.ts";
import { Clock } from "../infrastructure/clock.ts";

export const store = createStore(ActivitiesApi.create(), Clock.create());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function createStore(activitiesApi: ActivitiesApi, clock: Clock) {
  return configureStore({
    reducer: {
      activities: activitiesReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { activitiesApi, clock },
        },
      }),
  });
}
