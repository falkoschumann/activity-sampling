// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface LogActivityCommand {
  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export function createTestLogActivityCommand(
  command: Partial<LogActivityCommand> = {},
): LogActivityCommand {
  return {
    timestamp: "2024-12-18T08:30:00Z",
    duration: "PT30M",
    client: "Test client",
    project: "Test project",
    task: "Test task",
    ...command,
  };
}

export interface RecentActivitiesQuery {
  readonly timeZone?: string;
}

export function createTestRecentActivitiesQuery(
  query: Partial<RecentActivitiesQuery> = {},
): RecentActivitiesQuery {
  return {
    timeZone: "Europe/Berlin",
    ...query,
  };
}

export interface RecentActivitiesQueryResult {
  readonly lastActivity?: Activity;
  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;
}

export function createTestRecentActivitiesQueryResult(
  result: Partial<RecentActivitiesQueryResult> = {},
): RecentActivitiesQueryResult {
  return {
    lastActivity: createTestActivity({ dateTime: "2024-12-18T09:30" }),
    workingDays: [
      {
        date: "2024-12-18",
        activities: [createTestActivity({ dateTime: "2024-12-18T09:30" })],
      },
      {
        date: "2024-12-17",
        activities: [
          createTestActivity({ dateTime: "2024-12-17T17:00" }),
          createTestActivity({ dateTime: "2024-12-17T16:30" }),
          createTestActivity({
            dateTime: "2024-12-17T16:00",
            task: "Other task",
            notes: "Other notes",
          }),
        ],
      },
    ],
    timeSummary: {
      hoursToday: "PT30M",
      hoursYesterday: "PT1H30M",
      hoursThisWeek: "PT2H",
      hoursThisMonth: "PT2H",
    },
    ...result,
  };
}

export interface TimesheetQuery {
  readonly from: string;
  readonly to: string;
  readonly timeZone?: string;
}

export function createTestTimesheetQuery(
  query: Partial<TimesheetQuery> = {},
): TimesheetQuery {
  return {
    from: "2025-06-02",
    to: "2025-06-08",
    timeZone: "Europe/Berlin",
    ...query,
  };
}

export interface TimesheetQueryResult {
  readonly entries: TimesheetEntry[];
  readonly workingHoursSummary: WorkingHoursSummary;
}

export function createTestTimesheetQueryResult(
  result: Partial<TimesheetQueryResult> = {},
): TimesheetQueryResult {
  return {
    entries: [
      createTestTimesheetEntry({ date: "2025-06-02" }),
      createTestTimesheetEntry({ date: "2025-06-03" }),
    ],
    workingHoursSummary: createTestWorkingHoursSummary(),
    ...result,
  };
}

export interface WorkingHoursSummary {
  readonly totalHours: string;
  readonly capacity: string;
  readonly offset: string;
}

export function createTestWorkingHoursSummary(
  summary: Partial<WorkingHoursSummary> = {},
): WorkingHoursSummary {
  return {
    totalHours: "PT4H",
    capacity: "PT40H",
    offset: "PT12H",
    ...summary,
  };
}

export interface Activity {
  readonly dateTime: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export function createTestActivity(activity: Partial<Activity> = {}): Activity {
  return {
    dateTime: "2024-12-18T09:30",
    duration: "PT30M",
    client: "Test client",
    project: "Test project",
    task: "Test task",
    ...activity,
  };
}

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

export function createEmptyTimeSummary(): TimeSummary {
  return {
    hoursToday: "PT0S",
    hoursYesterday: "PT0S",
    hoursThisWeek: "PT0S",
    hoursThisMonth: "PT0S",
  };
}

export interface TimesheetEntry {
  readonly date: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: string;
}

export function createTestTimesheetEntry(
  entry: Partial<TimesheetEntry> = {},
): TimesheetEntry {
  return {
    date: "2025-06-04",
    client: "Test client",
    project: "Test project",
    task: "Test task",
    hours: "PT2H",
    ...entry,
  };
}

export interface ReportQuery {
  readonly scope: Scope;
  readonly from: string;
  readonly to: string;
  readonly timeZone?: string;
}

export function createTestReportQuery(
  query: Partial<ReportQuery> = {},
): ReportQuery {
  return {
    scope: Scope.PROJECTS,
    from: "2025-06-01",
    to: "2025-06-30",
    timeZone: "Europe/Berlin",
    ...query,
  };
}

export interface ReportQueryResult {
  readonly entries: ReportEntry[];
  readonly totalHours: string;
}

export function createTestReportQueryResult(
  result: Partial<ReportQueryResult> = {},
): ReportQueryResult {
  return {
    entries: [createTestReportEntry()],
    totalHours: "PT42H",
    ...result,
  };
}

export const Scope = Object.freeze({
  CLIENTS: "Clients",
  PROJECTS: "Projects",
  TASKS: "Tasks",
});

export type Scope = (typeof Scope)[keyof typeof Scope];

export interface ReportEntry {
  readonly name: string;
  readonly client?: string;
  readonly hours: string;
}

export function createTestReportEntry(
  entry: Partial<ReportEntry> = {},
): ReportEntry {
  return {
    name: "Test project",
    client: "Test client",
    hours: "PT42H",
    ...entry,
  };
}

export const PeriodUnit = Object.freeze({
  DAY: "Day",
  WEEK: "Week",
  MONTH: "Month",
  YEAR: "Year",
  ALL_TIME: "All time",
});

export type PeriodUnit = (typeof PeriodUnit)[keyof typeof PeriodUnit];
