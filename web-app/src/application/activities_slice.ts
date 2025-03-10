// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  SerializedError,
} from "@reduxjs/toolkit";

import { Activity, TimeSummary, WorkingDay } from "../domain/activities";
import { Duration } from "../domain/duration";
import {
  CommandStatus,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages";
import { ActivitiesApi } from "../infrastructure/activities_api";
import { NotificationClient } from "../infrastructure/notification_client";
import { Clock } from "../util/clock";
import { Timer } from "../util/timer";

// TODO Do not log empty activity, disable log button
// TODO Disable form while countdown is running and not elapsed

export interface ActivitiesState {
  readonly lastActivity?: Activity; // TODO Rename to currentActivity
  readonly countdown: {
    readonly duration: string;
    readonly remaining: string;
    readonly percentage: number;
    readonly isRunning: boolean;
  };
  readonly workingDays: WorkingDay[]; // TODO Rename to recentActivities
  readonly timeSummary: TimeSummary;
  readonly timeZone: string;
  readonly error?: {
    message: string;
  };
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
    readonly notificationClient: NotificationClient;
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
  await thunkAPI.dispatch(getRecentActivities({}));
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
  const { notificationClient, timer } = thunkAPI.extra;
  timer.schedule(
    () => thunkAPI.dispatch(progressCountdown({ seconds: 1 })),
    0,
    1000,
  );
  thunkAPI.dispatch(countdownStarted());
  notificationClient.requestPermission();
});

const progressCountdown = createAsyncThunk<
  unknown,
  { seconds: number },
  ActivitiesThunkConfig
>("activities/progressCountdown", async ({ seconds }, thunkAPI) => {
  const { notificationClient } = thunkAPI.extra;
  thunkAPI.dispatch(countdownProgressed({ seconds }));
  const remaining = Duration.parse(
    thunkAPI.getState().activities.countdown.remaining,
  );
  if (notificationClient.isGranted && !remaining.isPositive()) {
    notificationClient.show(
      "What are you working on?",
      thunkAPI.getState().activities.lastActivity?.task,
      "/apple-touch-icon.png",
    );
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
      state.countdown.percentage = 0;
    },
    activitySelected: (state, action: PayloadAction<Activity>) => {
      state.lastActivity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getRecentActivities.fulfilled, (state, action) => {
      return { ...state, ...action.payload, error: undefined };
    });
    builder.addCase(getRecentActivities.rejected, (state, action) => {
      logError("Could not get recent activities.", action.error);
      state.error = {
        message: "Could not get recent activities. Please try again later.",
      };
    });
    builder.addCase(logActivity.fulfilled, (state, action) => {
      if (!action.payload.success) {
        logError("Could not log activity.", {
          message: action.payload.errorMessage,
        });
        state.error = {
          message: `Could not log activity. ${action.payload.errorMessage}`,
        };
      } else {
        state.error = undefined;
      }
    });
    builder.addCase(logActivity.rejected, (state, action) => {
      logError("Could not log activity", action.error);
      state.error = {
        message: "Could not log activity. Please try again later.",
      };
    });
  },
  selectors: {
    selectLastActivity: (state) => state.lastActivity,
    selectCountdown: (state) => state.countdown,
    selectTimeSummary: (state) => state.timeSummary,
    selectWorkingDays: (state) => state.workingDays,
    selectTimeZone: (state) => state.timeZone,
    selectError: (state) => state.error,
  },
});

const { countdownStarted, countdownProgressed, countdownStopped } =
  activitiesSlice.actions;

export const { durationSelected, activitySelected } = activitiesSlice.actions;

export const {
  selectCountdown,
  selectError,
  selectLastActivity,
  selectTimeSummary,
  selectTimeZone,
  selectWorkingDays,
} = activitiesSlice.selectors;

export default activitiesSlice.reducer;

function logError(message: string, error: SerializedError) {
  let cause = "";
  if (error.name) {
    cause += error.name;
  }
  if (error.message) {
    if (cause.length === 0) {
      cause += error.message;
    } else {
      cause += `: ${error.message}`;
    }
  }
  if (error.stack) {
    cause += `\n${error.stack}`;
  }

  if (cause) {
    console.error(message, cause);
  } else {
    console.error(message);
  }
}
