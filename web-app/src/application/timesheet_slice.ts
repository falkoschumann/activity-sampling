// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  SerializedError,
} from "@reduxjs/toolkit";

import {
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
} from "../domain/activities";
import { ActivitiesApi } from "../infrastructure/activities_api";
import { Clock } from "./clock";

export type PeriodUnit = "Day" | "Week" | "Month";

interface TimesheetState {
  readonly period: {
    readonly from: string;
    readonly to: string;
    readonly unit: PeriodUnit;
  };
  readonly entries: TimesheetEntry[];
  readonly workingHoursSummary: {
    readonly totalHours: string;
    readonly capacity: string;
    readonly offset: string;
  };
  readonly error?: SerializedError;
}

const initialState: TimesheetState = {
  period: {
    from: "2025-06-02",
    to: "2025-06-08",
    unit: "Week",
  },
  entries: [],
  workingHoursSummary: {
    totalHours: "PT0S",
    capacity: "PT40H",
    offset: "PT0S",
  },
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
  reducers: {
    initPeriod: (
      state,
      action: PayloadAction<{
        from: string;
        to: string;
        unit: PeriodUnit;
      }>,
    ) => {
      state.period = action.payload;
    },
    changePeriod: (state, action: PayloadAction<{ unit: PeriodUnit }>) => {
      const { from } = state.period;
      const startDate = Temporal.PlainDate.from(from);
      if (action.payload.unit === "Day") {
        state.period.from = startDate.toString();
        state.period.to = startDate.toString();
        state.period.unit = "Day";
      } else if (action.payload.unit === "Week") {
        const monday = startDate.subtract({ days: startDate.dayOfWeek - 1 });
        const sunday = monday.add({ days: 6 });
        state.period.from = monday.toString();
        state.period.to = sunday.toString();
        state.period.unit = "Week";
      } else if (action.payload.unit === "Month") {
        const firstDayOfMonth = startDate.with({ day: 1 });
        const lastDayOfMonth = firstDayOfMonth.add({ months: 1 }).subtract({
          days: 1,
        });
        state.period.from = firstDayOfMonth.toString();
        state.period.to = lastDayOfMonth.toString();
        state.period.unit = "Month";
      }
    },
    nextPeriod: (state) => {
      const { from, to, unit } = state.period;
      const startDate = Temporal.PlainDate.from(from);
      const endDate = Temporal.PlainDate.from(to);
      if (unit === "Day") {
        state.period.from = startDate.add({ days: 1 }).toString();
        state.period.to = endDate.add({ days: 1 }).toString();
      } else if (unit === "Week") {
        state.period.from = startDate.add({ weeks: 1 }).toString();
        state.period.to = endDate.add({ weeks: 1 }).toString();
      } else if (unit === "Month") {
        state.period.from = startDate.add({ months: 1 }).toString();
        state.period.to = endDate
          .add({ months: 1 })
          .with({ day: 31 })
          .toString();
      }
    },
    previousPeriod: (state) => {
      const { from, to, unit } = state.period;
      const startDate = Temporal.PlainDate.from(from);
      const endDate = Temporal.PlainDate.from(to);
      if (unit === "Day") {
        state.period.from = startDate.subtract({ days: 1 }).toString();
        state.period.to = endDate.subtract({ days: 1 }).toString();
      } else if (unit === "Week") {
        state.period.from = startDate.subtract({ weeks: 1 }).toString();
        state.period.to = endDate.subtract({ weeks: 1 }).toString();
      } else if (unit === "Month") {
        state.period.from = startDate.subtract({ months: 1 }).toString();
        state.period.to = endDate
          .subtract({ months: 1 })
          .with({ day: 31 })
          .toString();
      }
    },
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

export const { changePeriod, initPeriod, nextPeriod, previousPeriod } =
  timesheetSlice.actions;

export const {
  selectError,
  selectPeriod,
  selectEntries,
  selectWorkingHoursSummary,
} = timesheetSlice.selectors;

export default timesheetSlice.reducer;

function initState(): TimesheetState {
  const today = Temporal.Now.plainDateISO();
  const monday = today.subtract({ days: today.dayOfWeek - 1 });
  const sunday = monday.add({ days: 6 });
  return {
    ...initialState,
    period: {
      from: monday.toString(),
      to: sunday.toString(),
      unit: "Week" as const,
    },
  };
}
