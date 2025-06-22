// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  SerializedError,
} from "@reduxjs/toolkit";

import { CommandStatus } from "../common/messages";
import {
  Activity,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  TimeSummary,
  WorkingDay,
} from "../domain/activities";
import { ActivitiesApi } from "../infrastructure/activities_api";
import { NotificationClient } from "../infrastructure/notification_client";
import { Clock } from "./clock";
import { Timer } from "./timer";

// TODO Windows log screen stops countdown, use service worker to keep it running?

interface LogState {
  readonly currentActivityForm: {
    readonly client: string;
    readonly project: string;
    readonly task: string;
    readonly notes: string;
    readonly disabled: boolean;
    readonly loggable: boolean;
  };
  readonly countdown: {
    readonly duration: string;
    readonly remaining: string;
    readonly percentage: number;
    readonly isRunning: boolean;
  };
  readonly recentActivities: WorkingDay[];
  readonly timeSummary: TimeSummary;
  readonly error?: SerializedError;
}

const initialState: LogState = {
  currentActivityForm: {
    client: "",
    project: "",
    task: "",
    notes: "",
    disabled: false,
    loggable: true,
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
  const currentActivityForm = selectCurrentActivityForm(thunkAPI.getState());
  const countdown = selectCountdown(thunkAPI.getState());
  const command: LogActivityCommand = {
    timestamp: clock.now().toISOString(),
    duration: countdown.duration,
    client: currentActivityForm.client.trim(),
    project: currentActivityForm.project.trim(),
    task: currentActivityForm.task.trim(),
    notes: currentActivityForm.notes.trim() || undefined,
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
  LogThunkConfig
>("log/progressCountdown", async ({ seconds }, thunkAPI) => {
  const { notificationClient } = thunkAPI.extra;
  thunkAPI.dispatch(countdownProgressed({ seconds }));
  const countdown = selectCountdown(thunkAPI.getState());
  const remaining = Temporal.Duration.from(countdown.remaining);
  const intervalElapsed = remaining.sign <= 0;
  if (intervalElapsed && notificationClient.isGranted) {
    const currentActivityForm = selectCurrentActivityForm(thunkAPI.getState());
    notificationClient.show("What are you working on?", {
      body:
        currentActivityForm.task.length > 0
          ? `${currentActivityForm.project} (${currentActivityForm.client}) ${currentActivityForm.task}`
          : undefined,
      icon: "/apple-touch-icon.png",
      requireInteraction: true,
    });
  }
});

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
      state.currentActivityForm[action.payload.name] = action.payload.text;
      state.currentActivityForm.loggable = isLoggable(
        state.currentActivityForm,
      );
    },
    activityLogged: (state) => {
      if (state.countdown.isRunning) {
        state.currentActivityForm.disabled = true;
        state.currentActivityForm.loggable = true;
      }
    },
    countdownStarted: (state) => {
      state.currentActivityForm.disabled = true;
      state.currentActivityForm.loggable = isLoggable(
        state.currentActivityForm,
      );
      state.countdown.remaining = state.countdown.duration;
      state.countdown.percentage = 0;
      state.countdown.isRunning = true;
    },
    countdownProgressed: (
      state,
      action: PayloadAction<{ seconds: number }>,
    ) => {
      const duration = Temporal.Duration.from(state.countdown.duration);
      let remaining = Temporal.Duration.from(
        state.countdown.remaining,
      ).subtract({ seconds: action.payload.seconds });
      if (remaining.sign === -1) {
        state.currentActivityForm.disabled = false;
        state.currentActivityForm.loggable = isLoggable(
          state.currentActivityForm,
        );
        remaining = duration.subtract({ seconds: action.payload.seconds });
      }
      state.countdown.remaining = remaining.toString();
      state.countdown.percentage = Math.round(
        (1 - remaining.total("seconds") / duration.total("seconds")) * 100,
      );
    },
    countdownStopped: (state) => {
      state.currentActivityForm.disabled = false;
      state.currentActivityForm.loggable = isLoggable(
        state.currentActivityForm,
      );
      state.countdown.isRunning = false;
    },
    durationSelected: (state, action: PayloadAction<{ duration: string }>) => {
      state.countdown.duration = action.payload.duration;
      state.countdown.remaining = action.payload.duration;
      state.countdown.percentage = 0;
    },
    activitySelected: (state, action: PayloadAction<Activity>) => {
      state.currentActivityForm.client = action.payload.client;
      state.currentActivityForm.project = action.payload.project;
      state.currentActivityForm.task = action.payload.task;
      state.currentActivityForm.notes = action.payload.notes ?? "";
      state.currentActivityForm.loggable = isLoggable(
        state.currentActivityForm,
      );
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
      state.currentActivityForm.client =
        action.payload.lastActivity?.client ?? "";
      state.currentActivityForm.project =
        action.payload.lastActivity?.project ?? "";
      state.currentActivityForm.task = action.payload.lastActivity?.task ?? "";
      state.currentActivityForm.notes =
        action.payload.lastActivity?.notes ?? "";
      state.currentActivityForm.loggable = isLoggable(
        state.currentActivityForm,
      );
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
    selectCurrentActivityForm: (state) => state.currentActivityForm,
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
  countdownStopped,
} = logSlice.actions;

export const { changeText, durationSelected, activitySelected } =
  logSlice.actions;

export const {
  selectCountdown,
  selectError,
  selectCurrentActivityForm,
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
