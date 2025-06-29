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

import * as periodReducer from "./period_reducer";
import { PeriodUnit } from "./timesheet_slice";

interface ReportsState {
  readonly period: {
    readonly from: string;
    readonly to: string;
    readonly unit: PeriodUnit;
  };
  readonly entries: ReportEntry[];
  readonly error?: SerializedError;
}

const initialState: ReportsState = {
  period: {
    from: "2025-06-01",
    to: "2025-06-30",
    unit: "Month",
  },
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
  reducers: {
    ...periodReducer,
  },
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
    selectPeriod: (state) => state.period,
    selectEntries: (state) => state.entries,
    selectError: (state) => state.error,
  },
});

export const { changePeriod, initPeriod, nextPeriod, previousPeriod } =
  reportsSlice.actions;

export const { selectEntries, selectError, selectPeriod } =
  reportsSlice.selectors;

export default reportsSlice.reducer;
