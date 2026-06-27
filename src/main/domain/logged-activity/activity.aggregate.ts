// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export type ActivityState = {
  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category?: string;
  readonly hours: Temporal.Duration;
};
