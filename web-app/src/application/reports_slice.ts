// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  createAsyncThunk,
  createSlice,
  SerializedError,
} from "@reduxjs/toolkit";

import { Clock } from "../common/clock";
import {
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
} from "../domain/activities";
import { ActivitiesApi } from "../infrastructure/activities_api";

interface ReportsState {
  readonly entries: ReportEntry[];
  readonly error?: SerializedError;
}

const initialState: ReportsState = {
  entries: [],
};

type ReportThunkConfig = {
  extra: {
    readonly activitiesApi: ActivitiesApi;
    readonly clock: Clock;
  };
  state: { readonly reports: ReportsState };
};

export const queryReport = createAsyncThunk<
  ReportQueryResult,
  ReportQuery,
  ReportThunkConfig
>("reports/queryReport", async (query, thunkAPI) => {
  const { activitiesApi } = thunkAPI.extra;
  const { scope, from, to } = query;
  const timeZone =
    query.timeZone != null
      ? query.timeZone
      : Intl.DateTimeFormat().resolvedOptions().timeZone;
  return activitiesApi.queryReport({ scope, from, to, timeZone });
});

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Query report
    builder.addCase(queryReport.pending, (state) => {
      state.error = undefined;
    });
    builder.addCase(queryReport.fulfilled, (state, action) => {
      state.entries = action.payload.entries;
    });
    builder.addCase(queryReport.rejected, (state) => {
      state.error = {
        message: "Could not get report. Please try again later.",
      };
    });
  },
  selectors: {
    selectEntries: (state) => state.entries,
    selectError: (state) => state.error,
  },
});

export const { selectEntries, selectError } = reportsSlice.selectors;

export default reportsSlice.reducer;
