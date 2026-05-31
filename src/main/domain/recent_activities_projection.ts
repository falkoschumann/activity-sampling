// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  isTimestampInPeriod,
  normalizeDuration,
} from "../../shared/domain/temporal";
import {
  type RecentActivitiesQuery,
  RecentActivitiesQueryResult,
  TimeSummary,
  WorkingDay,
} from "../../shared/domain/recent_activities_query";
import { LoggedActivity } from "../../shared/domain/logged_activity";
import type { Projection } from "./projection";
import type { ActivityLoggedEvent } from "./activity_logged_event";

export class RecentActivitiesProjection implements Projection<RecentActivitiesQueryResult> {
  static create({ query }: { query: RecentActivitiesQuery }) {
    return new RecentActivitiesProjection(query);
  }

  readonly #timeZone;
  readonly #from;
  readonly #to;
  readonly #timeSummaryProjection;

  #workingDays: WorkingDay[];
  #date?: Temporal.PlainDate;
  #activities!: LoggedActivity[];

  private constructor(query: RecentActivitiesQuery) {
    this.#timeZone = query.timeZone;
    this.#from = query.today.subtract({ days: 30 });
    this.#to = query.today.with({ day: query.today.daysInMonth });
    this.#timeSummaryProjection = TimeSummaryProjection.create(query);
    this.#workingDays = [];
  }

  update(event: ActivityLoggedEvent) {
    if (
      !isTimestampInPeriod(
        event.timestamp,
        this.#timeZone,
        this.#from,
        this.#to,
      )
    ) {
      return;
    }

    const activityDateTime = event.timestamp
      .toZonedDateTimeISO(this.#timeZone)
      .toPlainDateTime();
    if (
      this.#date == null ||
      !activityDateTime.toPlainDate().equals(this.#date)
    ) {
      this.#createWorkingDay();
      this.#date = activityDateTime.toPlainDate();
      this.#activities = [];
    }
    this.#activities.push(
      LoggedActivity.create({
        dateTime: activityDateTime,
        duration: event.duration,
        client: event.client,
        project: event.project,
        task: event.task,
        notes: event.notes,
        category: event.category,
      }),
    );
    this.#timeSummaryProjection.update(event);
  }

  get(): RecentActivitiesQueryResult {
    this.#createWorkingDay();
    const workingDays = this.#workingDays.reverse();
    const timeSummary = this.#timeSummaryProjection.get();
    return RecentActivitiesQueryResult.create({ workingDays, timeSummary });
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
  static create({
    today,
    timeZone,
  }: {
    today: Temporal.PlainDate | string;
    timeZone: Temporal.TimeZoneLike;
  }) {
    return new TimeSummaryProjection(today, timeZone);
  }

  readonly #today: Temporal.PlainDate;
  readonly #yesterday: Temporal.PlainDate;
  readonly #weekStart: Temporal.PlainDate;
  readonly #weekEnd: Temporal.PlainDate;
  readonly #monthStart: Temporal.PlainDate;
  readonly #monthEnd: Temporal.PlainDate;
  readonly #timeZone: Temporal.TimeZoneLike;

  #hoursToday;
  #hoursYesterday;
  #hoursThisWeek;
  #hoursThisMonth;

  private constructor(
    today: Temporal.PlainDate | string,
    timeZone: Temporal.TimeZoneLike,
  ) {
    this.#today = Temporal.PlainDate.from(today);
    this.#yesterday = this.#today.subtract("P1D");
    this.#weekStart = this.#today.subtract({ days: this.#today.dayOfWeek - 1 });
    this.#weekEnd = this.#weekStart.add("P6D");
    this.#monthStart = this.#today.with({ day: 1 });
    this.#monthEnd = this.#monthStart.add("P1M").subtract("P1D");
    this.#timeZone = timeZone;
    this.#hoursToday = Temporal.Duration.from("PT0S");
    this.#hoursYesterday = Temporal.Duration.from("PT0S");
    this.#hoursThisWeek = Temporal.Duration.from("PT0S");
    this.#hoursThisMonth = Temporal.Duration.from("PT0S");
  }

  update(event: ActivityLoggedEvent) {
    const date = event.timestamp
      .toZonedDateTimeISO(this.#timeZone)
      .toPlainDate();
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
