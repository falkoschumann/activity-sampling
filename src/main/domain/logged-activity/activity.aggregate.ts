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

const NO_CATEGORY = "";

export function filterCategory(categories: string[]) {
  return (activity: ActivityState) =>
    categories.length === 0 ||
    categories.includes(activity.category ?? NO_CATEGORY);
}
