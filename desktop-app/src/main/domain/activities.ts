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

export function createTestRecentActivitiesQueryResult(
  result: Partial<RecentActivitiesQueryResult> = {},
): RecentActivitiesQueryResult {
  return {
    lastActivity: createTestActivity({ dateTime: "2025-08-14T13:00" }),
    workingDays: [
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
    timeSummary: {
      hoursToday: "PT30M",
      hoursYesterday: "PT1H30M",
      hoursThisWeek: "PT2H",
      hoursThisMonth: "PT2H",
    },
    ...result,
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
  dateTime = "2025-08-14T13:00:00+02:00",
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

export interface TimeSummary {
  readonly hoursToday: string;
  readonly hoursYesterday: string;
  readonly hoursThisWeek: string;
  readonly hoursThisMonth: string;
}
