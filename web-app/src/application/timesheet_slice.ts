// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  createAsyncThunk,
  createSlice,
  SerializedError,
} from "@reduxjs/toolkit";

import { Clock } from "../common/clock";
import {
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
} from "../domain/activities";
import { ActivitiesApi } from "../infrastructure/activities_api";

interface TimesheetState {
  readonly period: {
    readonly from: string;
    readonly to: string;
  };
  readonly entries: TimesheetEntry[];
  readonly workingHoursSummary: {
    readonly totalHours: string;
    readonly capacity: string;
    readonly offset: string;
  };
  readonly timeZone: string;
  readonly error?: SerializedError;
}

const initialState: TimesheetState = {
  period: {
    from: "2025-06-02",
    to: "2025-06-08",
  },
  entries: [],
  workingHoursSummary: {
    totalHours: "PT0S",
    capacity: "PT40H",
    offset: "PT0S",
  },
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

type TimesheetThunkConfig = {
  extra: {
    readonly activitiesApi: ActivitiesApi;
    readonly clock: Clock;
  };
  state: { readonly timesheet: TimesheetState };
};

export const queryTimesheet = createAsyncThunk<
  TimesheetQueryResult,
  TimesheetQuery,
  TimesheetThunkConfig
>("timesheet/queryTimesheet", async (query, thunkAPI) => {
  const { activitiesApi } = thunkAPI.extra;
  const { from, to } = query;
  const timeZone =
    query.timeZone != null
      ? query.timeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  return activitiesApi.queryTimesheet({ from, to, timeZone });
});

const timesheetSlice = createSlice({
  name: "timesheet",
  initialState: initState(),
  reducers: {},
  extraReducers: (builder) => {
    // Query timesheet
    builder.addCase(queryTimesheet.pending, (state) => {
      state.error = undefined;
    });
    builder.addCase(queryTimesheet.fulfilled, (state, action) => {
      state.entries = action.payload.entries;
      state.workingHoursSummary = action.payload.workingHoursSummary;
      state.timeZone = action.payload.timeZone;
    });
    builder.addCase(queryTimesheet.rejected, (state) => {
      state.error = {
        message: "Could not get timesheet. Please try again later.",
      };
    });
  },
  selectors: {
    selectPeriod: (state) => state.period,
    selectEntries: (state) => state.entries,
    selectWorkingHoursSummary: (state) => state.workingHoursSummary,
    selectTimeZone: (state) => state.timeZone,
    selectError: (state) => state.error,
  },
});

export const {
  selectError,
  selectPeriod,
  selectEntries,
  selectTimeZone,
  selectWorkingHoursSummary,
} = timesheetSlice.selectors;

export default timesheetSlice.reducer;

function initState() {
  return {
    ...initialState,
    period: initPeriod(),
  };
}

function initPeriod() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Set to Monday
  startOfWeek.setHours(0, 0, 0, 0); // Set to start of day
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Sunday
  endOfWeek.setHours(23, 59, 59, 999); // Set to end of day
  return {
    from: toISODate(startOfWeek),
    to: toISODate(endOfWeek),
  };
}

function toISODate(date: Date): string {
  const offset = date.getTimezoneOffset();
  const isoDate = new Date(date.getTime() - offset * 60 * 1000);
  return isoDate.toISOString().substring(0, 10);
}
