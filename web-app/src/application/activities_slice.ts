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

// TODO Disable form while countdown is running and not elapsed

export interface ActivitiesState {
  readonly currentActivity: {
    readonly client: string;
    readonly project: string;
    readonly task: string;
    readonly notes: string;
    readonly isLogDisabled: boolean;
  };
  readonly countdown: {
    readonly duration: string;
    readonly remaining: string;
    readonly percentage: number;
    readonly isRunning: boolean;
  };
  readonly recentActivities: WorkingDay[];
  readonly timeSummary: TimeSummary;
  readonly timeZone: string;
  readonly error?: {
    message: string;
  };
}

const initialState: ActivitiesState = {
  currentActivity: {
    client: "",
    project: "",
    task: "",
    notes: "",
    isLogDisabled: true,
  },
  countdown: {
    duration: "PT30M",
    remaining: "PT30M",
    percentage: 0,
    isRunning: false,
  },
  recentActivities: [],
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
  unknown,
  ActivitiesThunkConfig
>("activities/logActivity", async (_action, thunkAPI) => {
  const { activitiesApi, clock } = thunkAPI.extra;
  const currentActivity = selectCurrentActivity(thunkAPI.getState());
  const command: LogActivityCommand = {
    start: clock.now().toISOString(),
    duration: thunkAPI.getState().activities.countdown.duration,
    client: currentActivity.client,
    project: currentActivity.project,
    task: currentActivity.task,
    notes: currentActivity.notes,
  };
  const status = await activitiesApi.logActivity(command);
  await thunkAPI.dispatch(queryRecentActivities({}));
  return status;
});

export const queryRecentActivities = createAsyncThunk<
  RecentActivitiesQueryResult,
  RecentActivitiesQuery,
  ActivitiesThunkConfig
>("activities/queryRecentActivities", async (query, thunkAPI) => {
  const { activitiesApi, clock } = thunkAPI.extra;
  const today =
    query.today != null
      ? query.today
      : clock.now().toISOString().substring(0, 10);
  const timeZone =
    query.timeZone != null
      ? query.timeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  return activitiesApi.queryRecentActivities({ today, timeZone });
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
      thunkAPI.getState().activities.currentActivity.task.length > 0
        ? thunkAPI.getState().activities.currentActivity.task
        : undefined,
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
    changeClient: (state, action: PayloadAction<{ text: string }>) => {
      state.currentActivity.client = action.payload.text;
      state.currentActivity.isLogDisabled = isLoggable(state.currentActivity);
    },
    changeProject: (state, action: PayloadAction<{ text: string }>) => {
      state.currentActivity.project = action.payload.text;
      state.currentActivity.isLogDisabled = isLoggable(state.currentActivity);
    },
    changeTask: (state, action: PayloadAction<{ text: string }>) => {
      state.currentActivity.task = action.payload.text;
      state.currentActivity.isLogDisabled = isLoggable(state.currentActivity);
    },
    changeNotes: (state, action: PayloadAction<{ text: string }>) => {
      state.currentActivity.notes = action.payload.text;
      state.currentActivity.isLogDisabled = isLoggable(state.currentActivity);
    },
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
      state.currentActivity.client = action.payload.client;
      state.currentActivity.project = action.payload.project;
      state.currentActivity.task = action.payload.task;
      state.currentActivity.notes = action.payload.notes ?? "";
      state.currentActivity.isLogDisabled = isLoggable(state.currentActivity);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logActivity.pending, (state, _action) => {
      state.error = undefined;
    });
    builder.addCase(logActivity.fulfilled, (state, action) => {
      if (action.payload.success) {
        return;
      }

      logError("Could not log activity.", {
        message: action.payload.errorMessage,
      });
      state.error = {
        message: `Could not log activity. ${action.payload.errorMessage}`,
      };
    });
    builder.addCase(logActivity.rejected, (state, action) => {
      logError("Could not log activity", action.error);
      state.error = {
        message: "Could not log activity. Please try again later.",
      };
    });

    builder.addCase(queryRecentActivities.pending, (state, _action) => {
      state.error = undefined;
    });
    builder.addCase(queryRecentActivities.fulfilled, (state, action) => {
      state.currentActivity.client = action.payload.lastActivity?.client ?? "";
      state.currentActivity.project =
        action.payload.lastActivity?.project ?? "";
      state.currentActivity.task = action.payload.lastActivity?.task ?? "";
      state.currentActivity.notes = action.payload.lastActivity?.notes ?? "";
      state.currentActivity.isLogDisabled = isLoggable(state.currentActivity);
      state.recentActivities = action.payload.workingDays;
      state.timeSummary = action.payload.timeSummary;
      if (action.payload.timeZone) {
        state.timeZone = action.payload.timeZone;
      }
    });
    builder.addCase(queryRecentActivities.rejected, (state, action) => {
      logError("Could not get recent activities.", action.error);
      state.error = {
        message: "Could not get recent activities. Please try again later.",
      };
    });
  },
  selectors: {
    selectCurrentActivity: (state) => state.currentActivity,
    selectCountdown: (state) => state.countdown,
    selectTimeSummary: (state) => state.timeSummary,
    selectRecentActivities: (state) => state.recentActivities,
    selectTimeZone: (state) => state.timeZone,
    selectError: (state) => state.error,
  },
});

const { countdownStarted, countdownProgressed, countdownStopped } =
  activitiesSlice.actions;

export const {
  changeClient,
  changeProject,
  changeTask,
  changeNotes,
  durationSelected,
  activitySelected,
} = activitiesSlice.actions;

export const {
  selectCountdown,
  selectError,
  selectCurrentActivity,
  selectTimeSummary,
  selectTimeZone,
  selectRecentActivities,
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

function isLoggable({
  client,
  project,
  task,
}: {
  client: string;
  project: string;
  task: string;
}) {
  return !(Boolean(client) && Boolean(project) && Boolean(task));
}
