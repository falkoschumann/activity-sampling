// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TimerStartedEvent } from "../domain/timer_started_event";

export class TimerStartedEventDto {
  static create({
    timestamp,
    interval,
  }: {
    timestamp: string;
    interval: string;
  }) {
    return new TimerStartedEventDto(timestamp, interval);
  }

  static fromModel(model: TimerStartedEvent): TimerStartedEventDto {
    return TimerStartedEventDto.create({
      timestamp: model.timestamp.toString(),
      interval: model.interval.toString(),
    });
  }

  readonly timestamp: string;
  readonly interval: string;

  private constructor(timestamp: string, interval: string) {
    this.timestamp = timestamp;
    this.interval = interval;
  }
}
