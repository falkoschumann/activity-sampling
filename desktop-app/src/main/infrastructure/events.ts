// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Ajv from "ajv";
import addFormats from "ajv-formats";

import { ActivityLoggedEvent } from "../../shared/domain/activities";

const ACTIVITY_LOGGED_EVENT_SCHEMA = {
  type: "object",
  properties: {
    timestamp: { type: "string", format: "iso-date-time" },
    duration: { type: "string", format: "duration" },
    client: { type: "string" },
    project: { type: "string" },
    task: { type: "string" },
    notes: { type: "string" },
  },
  required: ["timestamp", "duration", "client", "project", "task"],
  additionalProperties: false,
};

const ajv = new Ajv();
addFormats(ajv);

export class ActivityLoggedEventDto {
  static create({
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
  }: {
    timestamp: string;
    duration: string;
    client: string;
    project: string;
    task: string;
    notes?: string;
  }): ActivityLoggedEventDto {
    return new ActivityLoggedEventDto(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    );
  }

  static createTestInstance({
    timestamp = "2025-08-14T11:00:00Z",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
  }: Partial<ActivityLoggedEventDto> = {}): ActivityLoggedEventDto {
    return new ActivityLoggedEventDto(
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    );
  }

  static fromJson(json: unknown): ActivityLoggedEventDto {
    const valid = ajv.validate(ACTIVITY_LOGGED_EVENT_SCHEMA, json);
    if (valid) {
      return ActivityLoggedEventDto.create(json as ActivityLoggedEventDto);
    }

    const errors = JSON.stringify(ajv.errors, null, 2);
    console.error(`Invalid activity logged event data:\n${errors}`, json);
    throw new TypeError(`Invalid activity logged event data:\n${errors}`);
  }

  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;

  private constructor(
    timestamp: string,
    duration: string,
    client: string,
    project: string,
    task: string,
    notes?: string,
  ) {
    this.timestamp = timestamp;
    this.duration = duration;
    this.client = client;
    this.project = project;
    this.task = task;
    this.notes = notes;
  }

  validate(): ActivityLoggedEvent {
    return ActivityLoggedEvent.create(this);
  }
}
