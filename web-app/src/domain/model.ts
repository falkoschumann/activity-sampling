// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Duration } from "./duration";

export interface Activity {
  // TODO Rename to start?
  timestamp: Date;
  readonly duration: Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
}

export interface WorkingDay {
  readonly date: Date;
  readonly activities: Activity[];
}

export interface TimeSummary {
  readonly hoursToday: Duration;
  readonly hoursYesterday: Duration;
  readonly hoursThisWeek: Duration;
  readonly hoursThisMonth: Duration;
}
