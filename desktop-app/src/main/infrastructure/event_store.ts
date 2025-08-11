// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// TODO store events in CSV file

import { ConfigurableResponses } from "../../shared/common/configurable_responses";
import { OutputTracker } from "../../shared/common/output_tracker";

const RECORDED_EVENT = "recorded";

export class EventStore<T = unknown> extends EventTarget {
  static create<T>(): EventStore<T> {
    return new EventStore<T>();
  }

  static createNull<T>({
    events,
  }: { events?: T[][] | T[] } = {}): EventStore<T> {
    return new EventStore<T>(events);
  }

  #replayResponses: ConfigurableResponses<T[]>;

  constructor(replayResponses?: T[][] | T[]) {
    super();
    this.#replayResponses = ConfigurableResponses.create<T[]>(replayResponses);
  }

  async record(event: T) {
    this.dispatchEvent(new CustomEvent(RECORDED_EVENT, { detail: event }));
  }

  trackRecorded(): OutputTracker<T> {
    return OutputTracker.create(this, RECORDED_EVENT);
  }

  async replay(): Promise<T[]> {
    return this.#replayResponses.next();
  }
}
