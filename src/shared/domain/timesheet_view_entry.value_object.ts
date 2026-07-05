// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export interface TimesheetViewEntry {
  readonly timestamp: Temporal.PlainDateTimeLike;
  readonly duration: Temporal.DurationLike;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;
}
