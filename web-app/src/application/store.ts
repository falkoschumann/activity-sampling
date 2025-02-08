// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { configureStore } from "@reduxjs/toolkit";

import activitiesReducer from "./activities_slice";
import { ActivitiesApi } from "../infrastructure/activities_api.ts";

const activitiesApi = new ActivitiesApi();

export const store = configureStore({
  reducer: {
    activities: activitiesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { activitiesApi },
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
