// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { ActivityLoggedEvent } from "../domain/activities";

// region Events

export class ActivityLoggedEventDto {
  static create(dto: {
    dateTime: string;
    duration: string;
    client: string;
    project: string;
    task: string;
    notes?: string;
    category?: string;
  }): ActivityLoggedEventDto {
    return new ActivityLoggedEventDto(
      dto.dateTime,
      dto.duration,
      dto.client,
      dto.project,
      dto.task,
      dto.notes,
      dto.category,
    );
  }

  static from(model: ActivityLoggedEvent): ActivityLoggedEventDto {
    return ActivityLoggedEventDto.create({
      dateTime: model.dateTime.toString(),
      duration: model.duration.toString(),
      client: model.client,
      project: model.project,
      task: model.task,
      notes: model.notes,
      category: model.category,
    });
  }

  readonly dateTime: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;

  private constructor(
    dateTime: string,
    duration: string,
    client: string,
    project: string,
    task: string,
    notes?: string,
    category?: string,
  ) {
    this.dateTime = dateTime;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
    this.category = category;
  }

  validate(): ActivityLoggedEvent {
    return ActivityLoggedEvent.create({
      dateTime: Temporal.PlainDateTime.from(this.dateTime),
      duration: Temporal.Duration.from(this.duration),
      client: this.client,
      project: this.project,
      task: this.task,
      notes: this.notes,
      category: this.category,
    });
  }
}
