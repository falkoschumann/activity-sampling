// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { RecentActivity } from "./recent_activity";

export class WorkingDay {
  static compare(a: WorkingDay, b: WorkingDay) {
    return Temporal.PlainDate.compare(a.date, b.date);
  }

  static create({
    date,
    activities = [],
  }: {
    date: Temporal.PlainDateLike;
    activities?: RecentActivity[];
  }) {
    return new WorkingDay(date, activities);
  }

  static createTestInstance({
    date = "2026-03-29",
    activities = [RecentActivity.createTestInstance()],
  }: {
    date?: Temporal.PlainDateLike;
    activities?: RecentActivity[];
  } = {}) {
    return WorkingDay.create({
      date,
      activities,
    });
  }

  readonly date;
  readonly activities;

  private constructor(
    date: Temporal.PlainDateLike,
    activities: RecentActivity[],
  ) {
    this.date = Temporal.PlainDate.from(date);
    this.activities = activities.map((activity) =>
      RecentActivity.create(activity),
    );
  }
}
