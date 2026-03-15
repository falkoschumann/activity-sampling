// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

export class ActivityLoggedEvent {
  // TODO rename ActivityLoggedEvent to LoggedActivity
  // TODO remove duration?

  static create({
    dateTime,
    duration,
    client,
    project,
    task,
    notes,
    category,
  }: {
    dateTime: Temporal.PlainDateTimeLike | string;
    duration: Temporal.DurationLike | string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }): ActivityLoggedEvent {
    return new ActivityLoggedEvent(
      dateTime,
      duration,
      client,
      project,
      task,
      notes,
      category,
    );
  }

  static createTestInstance({
    dateTime = "2025-08-14T13:00",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
    category,
  }: {
    dateTime?: Temporal.PlainDateTimeLike | string;
    duration?: Temporal.DurationLike | string;
    client?: string;
    project?: string;
    task?: string;
    notes?: string;
    category?: string;
  } = {}): ActivityLoggedEvent {
    return ActivityLoggedEvent.create({
      dateTime,
      duration,
      client,
      project,
      task,
      notes,
      category,
    });
  }

  readonly dateTime: Temporal.PlainDateTime;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;

  private constructor(
    dateTime: Temporal.PlainDateTimeLike | string,
    duration: Temporal.DurationLike | string,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.dateTime = Temporal.PlainDateTime.from(dateTime);
    this.duration = Temporal.Duration.from(duration);
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
  }
}
