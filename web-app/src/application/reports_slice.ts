// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  createAsyncThunk,
  createSlice,
  type SerializedError,
} from "@reduxjs/toolkit";

import type {
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
} from "../domain/activities";
import { PeriodUnit } from "../domain/activities";
import { ActivitiesApi } from "../infrastructure/activities_api";
import periodReducers, {
  initialPeriodState,
  type PeriodState,
} from "./period_reducer";

interface ReportsState {
  readonly period: PeriodState;
  readonly entries: ReportEntry[];
  readonly error?: SerializedError;
}

function initialState(): ReportsState {
  return {
    period: initialPeriodState(PeriodUnit.WEEK),
    entries: [],
  };
}

type ReportThunkConfig = {
  extra: {
    readonly activitiesApi: ActivitiesApi;
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
    ...periodReducers,
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

export const { changePeriod, nextPeriod, previousPeriod } =
  reportsSlice.actions;

export const { selectEntries, selectError, selectPeriod } =
  reportsSlice.selectors;

export default reportsSlice.reducer;
