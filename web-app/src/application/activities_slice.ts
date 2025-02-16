// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Activity, TimeSummary, WorkingDay } from "../domain/activities.ts";
import {
  CommandStatus,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages.ts";
import { ActivitiesApi } from "../infrastructure/activities_api.ts";
import { Clock } from "../infrastructure/clock.ts";

export interface ActivitiesState {
  readonly lastActivity?: Activity;
  readonly duration: string;
  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;
  readonly timeZone: string;
}

const initialState: ActivitiesState = {
  duration: "PT30M",
  workingDays: [],
  timeSummary: {
    hoursToday: "PT0S",
    hoursYesterday: "PT0S",
    hoursThisWeek: "PT0S",
    hoursThisMonth: "PT0S",
  },
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

type ActivitiesThunkConfig = {
  extra: { readonly activitiesApi: ActivitiesApi; readonly clock: Clock };
  state: { readonly activities: ActivitiesState };
};

export const logActivity = createAsyncThunk<
  CommandStatus,
  {
    readonly client: string;
    readonly project: string;
    readonly task: string;
    readonly notes: string;
  },
  ActivitiesThunkConfig
>("activities/logActivity", async (action, thunkAPI) => {
  const { activitiesApi, clock } = thunkAPI.extra;
  const command: LogActivityCommand = {
    timestamp: clock.now().toISOString(),
    duration: thunkAPI.getState().activities.duration,
    client: action.client,
    project: action.project,
    task: action.task,
    notes: action.notes,
  };
  const status = await activitiesApi.logActivity(command);
  thunkAPI.dispatch(getRecentActivities({}));
  return status;
});

export const getRecentActivities = createAsyncThunk<
  RecentActivitiesQueryResult,
  RecentActivitiesQuery,
  ActivitiesThunkConfig
>("activities/getRecentActivities", async (query, thunkAPI) => {
  const { activitiesApi, clock } = thunkAPI.extra;
  const today =
    query.today != null
      ? query.today
      : clock.now().toISOString().substring(0, 10);
  const timeZone =
    query.timeZone != null
      ? query.timeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  return activitiesApi.getRecentActivities({ today, timeZone });
});

export const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    durationSelected: (state, action: PayloadAction<{ duration: string }>) => {
      state.duration = action.payload.duration;
    },
    lastActivitySelected: (state, action: PayloadAction<Activity>) => {
      state.lastActivity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRecentActivities.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
  },
  selectors: {
    selectLastActivity: (state) => state.lastActivity,
    selectDuration: (state) => state.duration,
    selectTimeSummary: (state) => state.timeSummary,
    selectWorkingDays: (state) => state.workingDays,
    selectTimeZone: (state) => state.timeZone,
  },
});

export const { durationSelected, lastActivitySelected } =
  activitiesSlice.actions;

export const {
  selectLastActivity,
  selectDuration,
  selectTimeSummary,
  selectTimeZone,
  selectWorkingDays,
} = activitiesSlice.selectors;

export default activitiesSlice.reducer;
