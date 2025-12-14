// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  ActivityLoggedEvent,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  TimeSummary,
  WorkingDay,
} from "../../shared/domain/activities";
import { normalizeDuration } from "../../shared/common/temporal";

export async function projectRecentActivities(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  query: RecentActivitiesQuery,
): Promise<RecentActivitiesQueryResult> {
  const today = query.today
    ? query.today
    : Temporal.Now.plainDateISO(query.timeZone);
  const from = today.subtract({ days: 30 });
  const to = today.with({ day: today.daysInMonth });
  const recentActivitiesProjection = new RecentActivitiesProjection();
  const timeSummaryProjection = new TimeSummaryProjection(today);
  for await (const event of filterEvents(replay, from, to)) {
    recentActivitiesProjection.update(event);
    timeSummaryProjection.update(event);
  }
  return {
    workingDays: recentActivitiesProjection.get(),
    timeSummary: timeSummaryProjection.get(),
  };
}

// TODO extract helper function

async function* filterEvents(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  from?: Temporal.PlainDate | Temporal.PlainDateLike | string,
  to?: Temporal.PlainDate | Temporal.PlainDateLike | string,
): AsyncGenerator<ActivityLoggedEvent> {
  for await (const event of replay) {
    const date = event.dateTime.toPlainDate();
    if (from && Temporal.PlainDate.compare(date, from) < 0) {
      continue;
    }
    if (to && Temporal.PlainDate.compare(date, to) > 0) {
      continue;
    }

    yield event;
  }
}

class RecentActivitiesProjection {
  #workingDays: WorkingDay[] = [];
  #date?: Temporal.PlainDate;
  #activities!: ActivityLoggedEvent[];

  update(event: ActivityLoggedEvent) {
    const activityDate = event.dateTime.toPlainDate();
    if (this.#date == null || !activityDate.equals(this.#date)) {
      this.#createWorkingDay();
      this.#date = activityDate;
      this.#activities = [];
    }
    this.#activities.push(
      ActivityLoggedEvent.create({
        dateTime: event.dateTime,
        duration: event.duration,
        client: event.client,
        project: event.project,
        task: event.task,
        notes: event.notes,
        category: event.category,
      }),
    );
  }

  get() {
    this.#createWorkingDay();
    return this.#workingDays.reverse();
  }

  #createWorkingDay() {
    if (this.#date == null) {
      return;
    }

    this.#activities = this.#activities.sort((a1, a2) =>
      Temporal.PlainDateTime.compare(a2.dateTime, a1.dateTime),
    );
    const day = WorkingDay.create({
      date: this.#date,
      activities: this.#activities,
    });
    this.#workingDays.push(day);
  }
}

class TimeSummaryProjection {
  readonly #today: Temporal.PlainDate;
  readonly #yesterday: Temporal.PlainDate;
  readonly #weekStart: Temporal.PlainDate;
  readonly #weekEnd: Temporal.PlainDate;
  readonly #monthStart: Temporal.PlainDate;
  readonly #monthEnd: Temporal.PlainDate;

  #hoursToday = Temporal.Duration.from("PT0S");
  #hoursYesterday = Temporal.Duration.from("PT0S");
  #hoursThisWeek = Temporal.Duration.from("PT0S");
  #hoursThisMonth = Temporal.Duration.from("PT0S");

  constructor(today: Temporal.PlainDate) {
    this.#today = today;
    this.#yesterday = today.subtract("P1D");
    this.#weekStart = today.subtract({ days: today.dayOfWeek - 1 });
    this.#weekEnd = this.#weekStart.add("P6D");
    this.#monthStart = today.with({ day: 1 });
    this.#monthEnd = this.#monthStart.add("P1M").subtract("P1D");
  }

  update(event: ActivityLoggedEvent) {
    const date = event.dateTime.toPlainDate();
    const hours = event.duration;
    if (date.equals(this.#today)) {
      this.#hoursToday = this.#hoursToday.add(hours);
    }
    if (date.equals(this.#yesterday)) {
      this.#hoursYesterday = this.#hoursYesterday.add(hours);
    }
    if (
      Temporal.PlainDate.compare(date, this.#weekStart) >= 0 &&
      Temporal.PlainDate.compare(date, this.#weekEnd) <= 0
    ) {
      this.#hoursThisWeek = this.#hoursThisWeek.add(hours);
    }
    if (
      Temporal.PlainDate.compare(date, this.#monthStart) >= 0 &&
      Temporal.PlainDate.compare(date, this.#monthEnd) <= 0
    ) {
      this.#hoursThisMonth = this.#hoursThisMonth.add(hours);
    }
  }

  get() {
    return TimeSummary.create({
      hoursToday: normalizeDuration(this.#hoursToday),
      hoursYesterday: normalizeDuration(this.#hoursYesterday),
      hoursThisWeek: normalizeDuration(this.#hoursThisWeek),
      hoursThisMonth: normalizeDuration(this.#hoursThisMonth),
    });
  }
}
