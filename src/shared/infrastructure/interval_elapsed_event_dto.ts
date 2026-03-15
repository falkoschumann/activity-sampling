// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { IntervalElapsedEvent } from "../domain/interval_elapsed_event";

export class IntervalElapsedEventDto {
  static create({
    timestamp,
    interval,
  }: {
    timestamp: string;
    interval: string;
  }) {
    return new IntervalElapsedEventDto(timestamp, interval);
  }

  static fromModel(model: IntervalElapsedEvent): IntervalElapsedEventDto {
    return IntervalElapsedEventDto.create({
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
