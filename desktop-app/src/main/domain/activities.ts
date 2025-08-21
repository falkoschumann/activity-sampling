// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface LogActivityCommand {
  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export function createTestLogActivityCommand({
  timestamp = "2025-08-14T11:00:00Z",
  duration = "PT30M",
  client = "Test client",
  project = "Test project",
  task = "Test task",
  notes,
}: Partial<LogActivityCommand> = {}): LogActivityCommand {
  return { timestamp, duration, client, project, task, notes };
}

export interface RecentActivitiesQuery {
  readonly timeZone?: string;
}

export function createTestRecentActivitiesQuery({
  timeZone = "Europe/Berlin",
}: Partial<RecentActivitiesQuery> = {}): RecentActivitiesQuery {
  return { timeZone };
}

export interface RecentActivitiesQueryResult {
  readonly lastActivity?: Activity;
  readonly workingDays: WorkingDay[];
  readonly timeSummary: TimeSummary;
}

export function createRecentActivitiesQueryResult({
  lastActivity,
  workingDays = [],
  timeSummary = {
    hoursToday: "PT0S",
    hoursYesterday: "PT0S",
    hoursThisWeek: "PT0S",
    hoursThisMonth: "PT0S",
  },
}: Partial<RecentActivitiesQueryResult> = {}): RecentActivitiesQueryResult {
  return { lastActivity, workingDays, timeSummary };
}

export function createTestRecentActivitiesQueryResult({
  lastActivity = createTestActivity({ dateTime: "2025-08-14T13:00" }),
  workingDays = [
    {
      date: "2025-08-14",
      activities: [createTestActivity({ dateTime: "2025-08-14T13:00" })],
    },
    {
      date: "2025-08-13",
      activities: [
        createTestActivity({ dateTime: "2025-08-13T16:00" }),
        createTestActivity({ dateTime: "2025-08-13T15:30" }),
        createTestActivity({
          dateTime: "2025-08-13T15:00",
          task: "Other task",
          notes: "Other notes",
        }),
      ],
    },
  ],
  timeSummary = {
    hoursToday: "PT30M",
    hoursYesterday: "PT1H30M",
    hoursThisWeek: "PT2H",
    hoursThisMonth: "PT2H",
  },
}: Partial<RecentActivitiesQueryResult> = {}): RecentActivitiesQueryResult {
  return { lastActivity, workingDays, timeSummary };
}

export interface ReportQuery {
  readonly scope: Scope;
  readonly from: string;
  readonly to: string;
  readonly timeZone?: string;
}

export function createTestReportQuery({
  scope = Scope.PROJECTS,
  from = "2025-06-01",
  to = "2025-06-30",
  timeZone = "Europe/Berlin",
}: Partial<ReportQuery> = {}): ReportQuery {
  return { scope, from, to, timeZone };
}

export interface ReportQueryResult {
  readonly entries: ReportEntry[];
  readonly totalHours: string;
}

export function createTestReportQueryResult({
  entries = [createTestReportEntry()],
  totalHours = "PT42H",
}: Partial<ReportQueryResult> = {}): ReportQueryResult {
  return { entries, totalHours };
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

export function createTestReportEntry({
  name = "Test client",
  client,
  hours = "PT42H",
}: Partial<ReportEntry> = {}): ReportEntry {
  return { name, client, hours };
}

export interface TimesheetQuery {
  readonly from: string;
  readonly to: string;
  readonly timeZone?: string;
}

export function createTestTimesheetQuery({
  from = "2025-06-02",
  to = "2025-06-08",
  timeZone = "Europe/Berlin",
}: Partial<TimesheetQuery> = {}): TimesheetQuery {
  return { from, to, timeZone };
}

export interface TimesheetQueryResult {
  readonly entries: TimesheetEntry[];
  readonly workingHoursSummary: WorkingHoursSummary;
}

export function createTestTimesheetQueryResult({
  entries = [
    createTestTimesheetEntry({ date: "2025-06-02" }),
    createTestTimesheetEntry({ date: "2025-06-03" }),
  ],
  workingHoursSummary = createTestWorkingHoursSummary(),
}: Partial<TimesheetQueryResult> = {}): TimesheetQueryResult {
  return { entries, workingHoursSummary };
}

export interface TimesheetEntry {
  readonly date: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: string;
}

export function createTestTimesheetEntry({
  date = "2025-06-04",
  client = "Test client",
  project = "Test project",
  task = "Test task",
  hours = "PT2H",
}: Partial<TimesheetEntry> = {}): TimesheetEntry {
  return { date, client, project, task, hours };
}

export interface WorkingHoursSummary {
  readonly totalHours: string;
  readonly capacity: string;
  readonly offset: string;
}

export function createTestWorkingHoursSummary({
  totalHours = "PT4H",
  capacity = "PT40H",
  offset = "PT12H",
}: Partial<WorkingHoursSummary> = {}): WorkingHoursSummary {
  return { totalHours, capacity, offset };
}

export interface Activity {
  readonly dateTime: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export function createActivity({
  dateTime,
  duration,
  client,
  project,
  task,
  notes,
}: Activity): Activity {
  return { dateTime, duration, client, project, task, notes };
}

export function createTestActivity({
  dateTime = "2025-08-14T13:00",
  duration = "PT30M",
  client = "Test client",
  project = "Test project",
  task = "Test task",
  notes,
}: Partial<Activity> = {}): Activity {
  return { dateTime, duration, client, project, task, notes };
}

export interface WorkingDay {
  readonly date: string;
  readonly activities: Activity[];
}

export function createWorkingDay({
  date = "2025-08-14",
  activities = [createTestActivity()],
}: Partial<WorkingDay> = {}): WorkingDay {
  return { date, activities };
}

export interface TimeSummary {
  readonly hoursToday: string;
  readonly hoursYesterday: string;
  readonly hoursThisWeek: string;
  readonly hoursThisMonth: string;
}

export function createTimeSummary({
  hoursToday = "PT0S",
  hoursYesterday = "PT0S",
  hoursThisWeek = "PT0S",
  hoursThisMonth = "PT0S",
}: Partial<TimeSummary> = {}): TimeSummary {
  return { hoursToday, hoursYesterday, hoursThisWeek, hoursThisMonth };
}
