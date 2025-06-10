// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface LogActivityCommand {
  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export interface RecentActivitiesQuery {
  readonly today?: string;
  readonly timeZone?: string;
}

export interface RecentActivitiesQueryResult {
  readonly lastActivity?: Activity;
  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;
  readonly timeZone: string;
}

export interface TimesheetQuery {
  readonly from: string;
  readonly to: string;
  readonly timeZone?: string;
}

export interface TimesheetQueryResult {
  readonly entries: TimesheetEntry[];
  readonly totalHours: string;
  readonly timeZone?: string;
}

export interface Activity {
  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export const TEST_ACTIVITY: Activity = Object.freeze({
  timestamp: "2024-12-18T09:30:00+01:00",
  duration: "PT30M",
  client: "ACME Inc.",
  project: "Foobar",
  task: "Do something",
  notes: "",
});

export interface WorkingDay {
  readonly date: string;
  readonly activities: Activity[];
}

export interface TimeSummary {
  readonly hoursToday: string;
  readonly hoursYesterday: string;
  readonly hoursThisWeek: string;
  readonly hoursThisMonth: string;
}

export interface TimesheetEntry {
  readonly date: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: string;
}
