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
  readonly entries: TimesheetEntry[];
  readonly totalHours: string;
  readonly capacity: string;
  readonly offset: string;
  readonly timeZone: string;
  readonly error?: SerializedError;
}

const initialState: TimesheetState = {
  entries: [],
  totalHours: "PT0S",
  capacity: "PT40H",
  offset: "PT0S",
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
  const { startInclusive, endExclusive } = query;
  const timeZone =
    query.timeZone != null
      ? query.timeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  return activitiesApi.queryTimesheet({
    startInclusive,
    endExclusive,
    timeZone,
  });
});

const timesheetSlice = createSlice({
  name: "timesheet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Query timesheet
    builder.addCase(queryTimesheet.pending, (state) => {
      state.error = undefined;
    });
    builder.addCase(queryTimesheet.fulfilled, (state, action) => {
      state.entries = action.payload.entries;
      state.totalHours = action.payload.totalHours;
      state.capacity = action.payload.capacity;
      state.offset = action.payload.offset;
      state.timeZone = action.payload.timeZone;
    });
    builder.addCase(queryTimesheet.rejected, (state) => {
      state.error = {
        message: "Could not get timesheet. Please try again later.",
      };
    });
  },
  selectors: {
    selectTimesheet: (state) => state.entries,
    selectTotalHours: (state) => state.totalHours,
    selectCapacity: (state) => state.capacity,
    selectOffset: (state) => state.offset,
    selectTimeZone: (state) => state.timeZone,
    selectError: (state) => state.error,
  },
});

export const {
  selectCapacity,
  selectError,
  selectOffset,
  selectTimesheet,
  selectTimeZone,
  selectTotalHours,
} = timesheetSlice.selectors;

export default timesheetSlice.reducer;
