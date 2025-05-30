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

interface ActivitiesState {
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
  readonly timeZone: string;
  readonly error?: SerializedError;
}

const initialState: ActivitiesState = {
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
  const { activitiesApi, notificationClient, clock } = thunkAPI.extra;
  const currentActivityForm = selectCurrentActivityForm(thunkAPI.getState());
  const countdown = selectCountdown(thunkAPI.getState());
  const command: LogActivityCommand = {
    timestamp: clock.now().toISOString(),
    duration: countdown.duration,
    client: currentActivityForm.client,
    project: currentActivityForm.project,
    task: currentActivityForm.task,
    notes: currentActivityForm.notes,
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
>("activities/startCountdown", async (_action, thunkAPI) => {
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
  const countdown = selectCountdown(thunkAPI.getState());
  const remaining = Duration.parse(countdown.remaining);
  if (notificationClient.isGranted && !remaining.isPositive()) {
    const currentActivityForm = selectCurrentActivityForm(thunkAPI.getState());
    notificationClient.show(
      "What are you working on?",
      currentActivityForm.task.length > 0
        ? currentActivityForm.task
        : undefined,
      "/apple-touch-icon.png",
    );
  }
});

export const stopCountdown = createAsyncThunk<
  unknown,
  unknown,
  ActivitiesThunkConfig
>("activities/stopCountdown", async (_action, thunkAPI) => {
  const { timer } = thunkAPI.extra;
  timer.cancel();
  thunkAPI.dispatch(countdownStopped());
});

const activitiesSlice = createSlice({
  name: "activities",
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
      state.currentActivityForm.loggable = true;
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
        state.currentActivityForm.disabled = false;
        state.currentActivityForm.loggable = isLoggable(
          state.currentActivityForm,
        );
        remaining = duration.minusSeconds(action.payload.seconds);
      }
      state.countdown.remaining = remaining.toString();
      state.countdown.percentage = Math.round(
        (1 - remaining.seconds / duration.seconds) * 100,
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
      if (action.payload.timeZone) {
        state.timeZone = action.payload.timeZone;
      }
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
    selectTimeZone: (state) => state.timeZone,
    selectError: (state) => state.error,
  },
});

const {
  activityLogged,
  countdownStarted,
  countdownProgressed,
  countdownStopped,
} = activitiesSlice.actions;

export const { changeText, durationSelected, activitySelected } =
  activitiesSlice.actions;

export const {
  selectCountdown,
  selectError,
  selectCurrentActivityForm,
  selectTimeSummary,
  selectTimeZone,
  selectRecentActivities,
} = activitiesSlice.selectors;

export default activitiesSlice.reducer;

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
