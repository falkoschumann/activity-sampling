// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
  type SerializedError,
} from "@reduxjs/toolkit";

import {
  PeriodUnit,
  type ReportEntry,
  type ReportQuery,
  type ReportQueryResult,
  Scope,
} from "../domain/activities";
import { ActivitiesApi } from "../infrastructure/activities_api";
import periodReducers, {
  initialPeriodState,
  type PeriodState,
} from "./period_reducer";

interface ReportsState {
  readonly period: PeriodState;
  readonly scope: Scope;
  readonly entries: ReportEntry[];
  readonly totalHours: string;
  readonly error?: SerializedError;
}

function initialState(): ReportsState {
  return {
    period: initialPeriodState(PeriodUnit.WEEK),
    scope: Scope.PROJECTS,
    entries: [],
    totalHours: "PT0S",
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
    changeScope: (state, action: PayloadAction<{ scope: Scope }>) => {
      const { scope } = action.payload;
      state.scope = scope;
    },
  },
  extraReducers: (builder) => {
    // Query report
    builder.addCase(queryReport.pending, (state) => {
      state.error = undefined;
    });
    builder.addCase(queryReport.fulfilled, (state, action) => {
      state.entries = action.payload.entries;
      state.totalHours = action.payload.totalHours;
    });
    builder.addCase(queryReport.rejected, (state) => {
      state.error = {
        message: "Could not get report. Please try again later.",
      };
    });
  },
  selectors: {
    selectPeriod: (state) => state.period,
    selectScope: (state) => state.scope,
    selectEntries: (state) => state.entries,
    selectTotalHours: (state) => state.totalHours,
    selectError: (state) => state.error,
  },
});

export const { changePeriod, changeScope, nextPeriod, previousPeriod } =
  reportsSlice.actions;

export const {
  selectEntries,
  selectError,
  selectPeriod,
  selectScope,
  selectTotalHours,
} = reportsSlice.selectors;

export default reportsSlice.reducer;
