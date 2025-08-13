// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// TODO store events in CSV file

import * as csv from "csv";
import fsPromise from "node:fs/promises";
import path from "node:path";

import { ConfigurableResponses } from "../../shared/common/configurable_responses";
import { OutputTracker } from "../../shared/common/output_tracker";

const RECORDED_EVENT = "recorded";

export const TIMESTAMP_COLUMN: string = "Timestamp";
export const DURATION_COLUMN: string = "Duration";
export const CLIENT_COLUMN: string = "Client";
export const PROJECT_COLUMN: string = "Project";
export const TASK_COLUMN: string = "Task";
export const NOTES_COLUMN: string = "Notes";

const ACTIVITY_COLUMNS = [
  TIMESTAMP_COLUMN,
  DURATION_COLUMN,
  CLIENT_COLUMN,
  PROJECT_COLUMN,
  TASK_COLUMN,
  NOTES_COLUMN,
];

export class EventStore<T = unknown> extends EventTarget {
  static create<T>(fileName = "data/events.csv"): EventStore<T> {
    return new EventStore<T>(fileName, fsPromise);
  }

  static createNull<T>({
    events,
  }: { events?: T[][] | T[] } = {}): EventStore<T> {
    return new EventStore<T>("null-file-csv", events);
  }

  #fileName: string;
  #replayResponses: ConfigurableResponses<T[]>;

  constructor(fileName: string, replayResponses?: T[][] | T[]) {
    super();
    this.#fileName = fileName;
    this.#replayResponses = ConfigurableResponses.create<T[]>(replayResponses);
  }

  async record(event: T) {
    const dirName = path.resolve(path.dirname(this.#fileName));
    await fsPromise.mkdir(dirName, { recursive: true });

    const header = false; // TODO set to true ife file does not exist
    const stringifier = csv.stringify({ columns: ACTIVITY_COLUMNS, header });
    this.dispatchEvent(new CustomEvent(RECORDED_EVENT, { detail: event }));
  }

  trackRecorded(): OutputTracker<T> {
    return OutputTracker.create(this, RECORDED_EVENT);
  }

  async replay(): Promise<T[]> {
    return this.#replayResponses.next();
  }
}

class FsPromiseStub {
  async mkdir() {
    return Promise.resolve(undefined);
  }
}
