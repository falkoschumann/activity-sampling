// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import Ajv from "ajv";
import addFormats from "ajv-formats";

const ACTIVITY_LOGGED_EVENT_SCHEMA = {
  type: "object",
  properties: {
    timestamp: { type: "string", format: "date-time" },
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

export class ActivityLoggedEvent {
  static create({
    timestamp,
    duration,
    client,
    project,
    task,
    notes,
  }: ActivityLoggedEvent): ActivityLoggedEvent {
    return new ActivityLoggedEvent({
      timestamp,
      duration,
      client,
      project,
      task,
      notes,
    });
  }

  static createTestData({
    timestamp = "2025-08-14T11:00:00Z",
    duration = "PT30M",
    client = "Test client",
    project = "Test project",
    task = "Test task",
    notes,
  }: Partial<ActivityLoggedEvent> = {}): ActivityLoggedEvent {
    return { timestamp, duration, client, project, task, notes };
  }

  static from(data: unknown): ActivityLoggedEvent {
    const valid = ajv.validate(ACTIVITY_LOGGED_EVENT_SCHEMA, data);
    if (valid) {
      return ActivityLoggedEvent.create(data as ActivityLoggedEvent);
    }

    const errors = JSON.stringify(ajv.errors, null, 2);
    throw new TypeError(`Invalid activity logged event data:\n${errors}`);
  }

  readonly timestamp: string;
  readonly duration: string;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;

  constructor(data: ActivityLoggedEvent) {
    this.timestamp = data.timestamp;
    this.duration = data.duration;
    this.client = data.client;
    this.project = data.project;
    this.task = data.task;
    this.notes = data.notes;
  }
}
