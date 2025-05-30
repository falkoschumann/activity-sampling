// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

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
