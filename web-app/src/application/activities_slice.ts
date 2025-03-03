// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Activity, TimeSummary, WorkingDay } from "../domain/activities.ts";
import { Duration } from "../domain/duration.ts";
import {
  CommandStatus,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages.ts";
import { ActivitiesApi } from "../infrastructure/activities_api.ts";
import { Clock } from "../util/clock.ts";
import { Timer } from "../util/timer.ts";

export interface ActivitiesState {
  readonly lastActivity?: Activity;
  readonly countdown: {
    readonly duration: string;
    readonly remaining: string;
    readonly percentage: number;
    readonly isRunning: boolean;
  };
  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;
  readonly timeZone: string;
}

const initialState: ActivitiesState = {
  countdown: {
    duration: "PT30M",
    remaining: "PT30M",
    percentage: 0,
    isRunning: false,
  },
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
  extra: {
    readonly activitiesApi: ActivitiesApi;
    readonly clock: Clock;
    readonly timer: Timer;
  };
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
    start: clock.now().toISOString(),
    duration: thunkAPI.getState().activities.countdown.duration,
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

export const startCountdown = createAsyncThunk<
  unknown,
  unknown,
  ActivitiesThunkConfig
>("activities/startCountdown", async (_, thunkAPI) => {
  const { timer } = thunkAPI.extra;
  timer.schedule(
    () => thunkAPI.dispatch(progressCountdown({ seconds: 1 })),
    0,
    1000,
  );
  thunkAPI.dispatch(countdownStarted());

  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
});

const progressCountdown = createAsyncThunk<
  unknown,
  { seconds: number },
  ActivitiesThunkConfig
>("activities/progressCountdown", async ({ seconds }, thunkAPI) => {
  thunkAPI.dispatch(countdownProgressed({ seconds }));
  const remaining = Duration.parse(
    thunkAPI.getState().activities.countdown.remaining,
  ).minusSeconds(seconds);
  if (Notification.permission === "granted" && !remaining.isPositive()) {
    // TODO Show notification only once
    new Notification("What are you working on?", {
      icon: "/apple-touch-icon.png",
    });
  }
});

export const stopCountdown = createAsyncThunk<
  unknown,
  unknown,
  ActivitiesThunkConfig
>("activities/stopCountdown", async (_, thunkAPI) => {
  const { timer } = thunkAPI.extra;
  timer.cancel();
  thunkAPI.dispatch(countdownStopped());
});

export const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    countdownStarted: (state) => {
      state.countdown.remaining = state.countdown.duration;
      state.countdown.percentage = 0;
      state.countdown.isRunning = true;
    },
    countdownProgressed: (
      state,
      action: PayloadAction<{ seconds: number }>,
    ) => {
      const duration = Duration.parse(state.countdown.duration);
      let remaining = Duration.parse(state.countdown.remaining).minusSeconds(
        action.payload.seconds,
      );
      if (remaining.isNegative()) {
        remaining = duration.minusSeconds(action.payload.seconds);
      }
      state.countdown.remaining = remaining.toString();
      state.countdown.percentage = Math.round(
        (1 - remaining.seconds / duration.seconds) * 100,
      );
    },
    countdownStopped: (state) => {
      state.countdown.isRunning = false;
    },
    durationSelected: (state, action: PayloadAction<{ duration: string }>) => {
      state.countdown.duration = action.payload.duration;
      state.countdown.remaining = action.payload.duration;
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
    selectCountdown: (state) => state.countdown,
    selectTimeSummary: (state) => state.timeSummary,
    selectWorkingDays: (state) => state.workingDays,
    selectTimeZone: (state) => state.timeZone,
  },
});

const { countdownStarted, countdownProgressed, countdownStopped } =
  activitiesSlice.actions;

export const { durationSelected, lastActivitySelected } =
  activitiesSlice.actions;

export const {
  selectLastActivity,
  selectCountdown,
  selectTimeSummary,
  selectTimeZone,
  selectWorkingDays,
} = activitiesSlice.selectors;

export default activitiesSlice.reducer;
