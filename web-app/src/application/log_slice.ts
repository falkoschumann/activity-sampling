// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
  type SerializedError,
} from "@reduxjs/toolkit";

import { Clock } from "../common/clock";
import type { CommandStatus } from "../common/messages";
import { Timer } from "../common/timer";
import type {
  Activity,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  TimeSummary,
  WorkingDay,
} from "../domain/activities";
import { ActivitiesApi } from "../infrastructure/activities_api";
import { NotificationClient } from "../infrastructure/notification_client";

interface LogState {
  readonly currentActivity: {
    readonly client: string;
    readonly project: string;
    readonly task: string;
    readonly notes: string;
    readonly isDisabled: boolean;
    readonly isLoggable: boolean;
  };
  readonly countdown: {
    readonly duration: string;
    readonly remaining: string;
    readonly percentage: number;
    readonly isRunning: boolean;
    readonly isElapsed: boolean;
    readonly end: string;
  };
  readonly recentActivities: WorkingDay[];
  readonly timeSummary: TimeSummary;
  readonly error?: SerializedError;
}

const initialState: LogState = {
  currentActivity: {
    client: "",
    project: "",
    task: "",
    notes: "",
    isDisabled: false,
    isLoggable: false,
  },
  countdown: {
    duration: "PT30M",
    remaining: "PT30M",
    percentage: 0,
    isRunning: false,
    isElapsed: false,
    end: "1970-01-01T00:00:00Z",
  },
  recentActivities: [],
  timeSummary: {
    hoursToday: "PT0S",
    hoursYesterday: "PT0S",
    hoursThisWeek: "PT0S",
    hoursThisMonth: "PT0S",
  },
};

type LogThunkConfig = {
  extra: {
    readonly activitiesApi: ActivitiesApi;
    readonly notificationClient: NotificationClient;
    readonly clock: Clock;
    readonly timer: Timer;
  };
  state: { readonly log: LogState };
};

export const logActivity = createAsyncThunk<
  CommandStatus,
  unknown,
  LogThunkConfig
>("log/logActivity", async (_action, thunkAPI) => {
  const { activitiesApi, notificationClient, clock } = thunkAPI.extra;
  const currentActivity = selectCurrentActivity(thunkAPI.getState());
  const countdown = selectCountdown(thunkAPI.getState());
  const command: LogActivityCommand = {
    timestamp: clock.now().toISOString(),
    duration: countdown.duration,
    client: currentActivity.client.trim(),
    project: currentActivity.project.trim(),
    task: currentActivity.task.trim(),
    notes: currentActivity.notes.trim() || undefined,
  };
  const status = await activitiesApi.logActivity(command);
  await thunkAPI.dispatch(queryRecentActivities({}));
  notificationClient.hide();
  thunkAPI.dispatch(activityLogged());
  return status;
});

export const queryRecentActivities = createAsyncThunk<
  RecentActivitiesQueryResult,
  RecentActivitiesQuery,
  LogThunkConfig
>("log/queryRecentActivities", async (query, thunkAPI) => {
  const { activitiesApi } = thunkAPI.extra;
  const timeZone =
    query.timeZone != null
      ? query.timeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  return activitiesApi.queryRecentActivities({ timeZone });
});

export const startCountdown = createAsyncThunk<
  unknown,
  unknown,
  LogThunkConfig
>("log/startCountdown", async (_action, thunkAPI) => {
  const { clock, notificationClient, timer } = thunkAPI.extra;
  timer.schedule(
    () => thunkAPI.dispatch(progressCountdown({ seconds: 1 })),
    0,
    1000,
  );
  const start = clock.now().toISOString();
  thunkAPI.dispatch(countdownStarted({ start }));
  notificationClient.requestPermission();
});

const progressCountdown = createAsyncThunk<unknown, unknown, LogThunkConfig>(
  "log/progressCountdown",
  async (_action, thunkAPI) => {
    const { clock, notificationClient } = thunkAPI.extra;
    const now = clock.now().toISOString();
    thunkAPI.dispatch(countdownProgressed({ now }));
    const { isElapsed } = selectCountdown(thunkAPI.getState());
    if (isElapsed && notificationClient.isGranted) {
      const currentActivity = selectCurrentActivity(thunkAPI.getState());
      notificationClient.show(
        "What are you working on?",
        {
          body:
            currentActivity.task.length > 0
              ? `${currentActivity.project} (${currentActivity.client}) ${currentActivity.task}`
              : undefined,
          icon: "/apple-touch-icon.png",
          requireInteraction: true,
        },
        () => {
          thunkAPI.dispatch(logActivity({}));
        },
      );
      thunkAPI.dispatch(countdownExpirationNotified());
    }
  },
);

export const stopCountdown = createAsyncThunk<unknown, unknown, LogThunkConfig>(
  "log/stopCountdown",
  async (_action, thunkAPI) => {
    const { timer } = thunkAPI.extra;
    timer.cancel();
    thunkAPI.dispatch(countdownStopped());
  },
);

const logSlice = createSlice({
  name: "log",
  initialState,
  reducers: {
    changeText: (
      state,
      action: PayloadAction<{
        name: "client" | "project" | "task" | "notes";
        text: string;
      }>,
    ) => {
      state.currentActivity[action.payload.name] = action.payload.text;
      state.currentActivity.isLoggable = isLoggable(state.currentActivity);
    },
    activityLogged: (state) => {
      if (state.countdown.isRunning) {
        state.currentActivity.isDisabled = true;
        state.currentActivity.isLoggable = true;
      }
    },
    countdownStarted: (state, action: PayloadAction<{ start: string }>) => {
      state.currentActivity.isDisabled = true;
      state.currentActivity.isLoggable = isLoggable(state.currentActivity);
      state.countdown.remaining = state.countdown.duration;
      state.countdown.percentage = 0;
      state.countdown.isRunning = true;
      state.countdown.end = Temporal.Instant.from(action.payload.start)
        .add(state.countdown.duration)
        .toString();
    },
    countdownProgressed: (state, action: PayloadAction<{ now: string }>) => {
      const duration = Temporal.Duration.from(state.countdown.duration);
      const end = Temporal.Instant.from(state.countdown.end);
      const current = Temporal.Instant.from(action.payload.now);
      let remaining = end
        .since(current)
        .round({ largestUnit: "hour", smallestUnit: "second" });
      if (remaining.sign <= 0) {
        state.currentActivity.isDisabled = false;
        state.currentActivity.isLoggable = isLoggable(state.currentActivity);
        state.countdown.isElapsed = true;
        state.countdown.end = Temporal.Instant.from(end)
          .add(state.countdown.duration)
          .toString();
        if (remaining.abs().total("seconds") < duration.total("seconds")) {
          remaining = duration.subtract(remaining.abs());
        } else {
          remaining = duration;
        }
      }
      state.countdown.remaining = remaining.toString();
      state.countdown.percentage = Math.round(
        (1 - remaining.total("seconds") / duration.total("seconds")) * 100,
      );
    },
    countdownExpirationNotified: (state) => {
      state.countdown.isElapsed = false;
    },
    countdownStopped: (state) => {
      state.currentActivity.isDisabled = false;
      state.currentActivity.isLoggable = isLoggable(state.currentActivity);
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
      state.currentActivity.isLoggable = isLoggable(state.currentActivity);
    },
  },
  extraReducers: (builder) => {
    // Log activity
    builder.addCase(logActivity.pending, (state) => {
      state.error = undefined;
    });
    builder.addCase(logActivity.fulfilled, (state, action) => {
      if (action.payload.success) {
        return;
      }

      state.error = {
        message: `Could not log activity. ${action.payload.errorMessage}`,
      };
    });
    builder.addCase(logActivity.rejected, (state) => {
      state.error = {
        message: "Could not log activity. Please try again later.",
      };
    });

    // Query recent activities
    builder.addCase(queryRecentActivities.pending, (state) => {
      state.error = undefined;
    });
    builder.addCase(queryRecentActivities.fulfilled, (state, action) => {
      state.currentActivity.client = action.payload.lastActivity?.client ?? "";
      state.currentActivity.project =
        action.payload.lastActivity?.project ?? "";
      state.currentActivity.task = action.payload.lastActivity?.task ?? "";
      state.currentActivity.notes = action.payload.lastActivity?.notes ?? "";
      state.currentActivity.isLoggable = isLoggable(state.currentActivity);
      state.recentActivities = action.payload.workingDays;
      state.timeSummary = action.payload.timeSummary;
    });
    builder.addCase(queryRecentActivities.rejected, (state) => {
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
    selectError: (state) => state.error,
  },
});

const {
  activityLogged,
  countdownStarted,
  countdownProgressed,
  countdownExpirationNotified,
  countdownStopped,
} = logSlice.actions;

export const { changeText, durationSelected, activitySelected } =
  logSlice.actions;

export const {
  selectCountdown,
  selectError,
  selectCurrentActivity,
  selectTimeSummary,
  selectRecentActivities,
} = logSlice.selectors;

export default logSlice.reducer;

function isLoggable({
  client,
  project,
  task,
}: {
  client: string;
  project: string;
  task: string;
}) {
  return client.length > 0 && project.length > 0 && task.length > 0;
}
