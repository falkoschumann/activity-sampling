// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { ActivityLoggedEvent } from "../../shared/domain/activities";
import { normalizeDuration } from "../../shared/common/temporal";

export class Activity {
  static create({
    start,
    finish,
    client,
    project,
    task,
    hours,
  }: {
    start: Temporal.PlainDateLike | string;
    finish: Temporal.PlainDateLike | string;
    client: string;
    project: string;
    task: string;
    hours: Temporal.DurationLike | string;
  }): Activity {
    return new Activity(start, finish, client, project, task, hours);
  }

  static createTestInstance({
    start = "2025-08-14",
    finish = "2025-08-14",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    hours = "PT30M",
  }: {
    start: Temporal.PlainDateLike | string;
    finish: Temporal.PlainDateLike | string;
    client?: string;
    project?: string;
    task?: string;
    hours: Temporal.DurationLike | string;
  }): Activity {
    return new Activity(start, finish, client, project, task, hours);
  }

  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: Temporal.Duration;

  private constructor(
    start: Temporal.PlainDateLike | string,
    finish: Temporal.PlainDateLike | string,
    client: string,
    project: string,
    task: string,
    hours: Temporal.DurationLike | string,
  ) {
    this.start = Temporal.PlainDate.from(start);
    this.finish = Temporal.PlainDate.from(finish);
    this.client = client;
    this.project = project;
    this.task = task;
    this.hours = Temporal.Duration.from(hours);
  }
}

export class ActivitiesProjection {
  readonly #categories: string[];
  #activities: Activity[] = [];

  constructor(categories: string[] = []) {
    this.#categories = categories;
  }

  update(event: ActivityLoggedEvent) {
    if (!this.#isSelectedCategory(event.category)) {
      return;
    }

    const date = event.dateTime.toPlainDate();
    const index = this.#findIndexOfActivity(event);
    if (index === -1) {
      this.#addActivity(date, event);
    } else {
      this.updateActivity(index, date, event);
    }
  }

  get() {
    return this.#activities;
  }

  #isSelectedCategory(category?: string) {
    return (
      this.#categories.length == 0 || this.#categories.includes(category ?? "")
    );
  }

  #findIndexOfActivity(event: ActivityLoggedEvent) {
    return this.#activities.findIndex(
      (activity) =>
        activity.client === event.client &&
        activity.project === event.project &&
        activity.task === event.task,
    );
  }

  #addActivity(date: Temporal.PlainDate, event: ActivityLoggedEvent) {
    const activity = Activity.create({
      start: date,
      finish: date,
      client: event.client,
      project: event.project,
      task: event.task,
      hours: event.duration,
    });
    this.#activities.push(activity);
  }

  private updateActivity(
    index: number,
    date: Temporal.PlainDate,
    event: ActivityLoggedEvent,
  ) {
    const activity = this.#activities[index];
    let start = activity.start;
    let finish = activity.finish;
    if (Temporal.PlainDate.compare(date, start) < 0) {
      start = date;
    }
    if (Temporal.PlainDate.compare(date, finish) > 0) {
      finish = date;
    }
    const hours = activity.hours.add(event.duration);
    this.#activities[index] = Activity.create({
      ...activity,
      start,
      finish,
      hours: normalizeDuration(hours),
    });
  }
}

export class CategoriesProjection {
  #categories: string[] = [];

  update(event: ActivityLoggedEvent) {
    if (this.#categories.includes(event.category ?? "")) {
      return;
    }

    this.#categories.push(event.category ?? "");
  }

  get() {
    return this.#categories.sort();
  }
}

export class TotalHoursProjection {
  #totalHours = Temporal.Duration.from("PT0S");

  update(event: ActivityLoggedEvent) {
    this.#totalHours = this.#totalHours.add(event.duration);
  }

  get() {
    return normalizeDuration(this.#totalHours);
  }
}

export async function* filterEvents(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  from?: Temporal.PlainDate | Temporal.PlainDateLike | string,
  to?: Temporal.PlainDate | Temporal.PlainDateLike | string,
): AsyncGenerator<ActivityLoggedEvent> {
  for await (const event of replay) {
    if (isDateInPeriod(event.dateTime.toPlainDate(), from, to)) {
      yield event;
    }
  }
}

function isDateInPeriod(
  date: Temporal.PlainDate | Temporal.PlainDateLike | string,
  from?: Temporal.PlainDate | Temporal.PlainDateLike | string,
  to?: Temporal.PlainDate | Temporal.PlainDateLike | string,
) {
  if (from && Temporal.PlainDate.compare(date, from) < 0) {
    return false;
  }
  if (to && Temporal.PlainDate.compare(date, to) > 0) {
    return false;
  }
  return true;
}
