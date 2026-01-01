// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createAsyncThunk,
  createSlice,
  type SerializedError,
} from "@reduxjs/toolkit";

import {
  PeriodUnit,
  type TimesheetEntry,
  type TimesheetQuery,
  type TimesheetQueryResult,
} from "../domain/activities";
import { ActivitiesApi } from "../infrastructure/activities_api";
import periodReducers, {
  initialPeriodState,
  type PeriodState,
} from "./period_reducer";

interface TimesheetState {
  readonly period: PeriodState;
  readonly entries: TimesheetEntry[];
  readonly workingHoursSummary: {
    readonly totalHours: string;
    readonly capacity: string;
    readonly offset: string;
  };
  readonly error?: SerializedError;
}

function initialState(): TimesheetState {
  return {
    period: initialPeriodState(PeriodUnit.WEEK),
    entries: [],
    workingHoursSummary: {
      totalHours: "PT0S",
      capacity: "PT40H",
      offset: "PT0S",
    },
  };
}

type TimesheetThunkConfig = {
  extra: {
    readonly activitiesApi: ActivitiesApi;
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
  initialState,
  reducers: {
    ...periodReducers,
  },
  extraReducers: (builder) => {
    // Query timesheet
    builder.addCase(queryTimesheet.pending, (state) => {
      state.error = undefined;
    });
    builder.addCase(queryTimesheet.fulfilled, (state, action) => {
      state.entries = action.payload.entries;
      state.workingHoursSummary = action.payload.workingHoursSummary;
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
    selectError: (state) => state.error,
  },
});

export const { changePeriod, nextPeriod, previousPeriod } =
  timesheetSlice.actions;

export const {
  selectEntries,
  selectError,
  selectPeriod,
  selectWorkingHoursSummary,
} = timesheetSlice.selectors;

export default timesheetSlice.reducer;
