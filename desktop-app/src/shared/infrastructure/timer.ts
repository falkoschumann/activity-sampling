// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  IntervalElapsedEvent,
  type TimerStartedEvent,
  TimerStoppedEvent,
} from "../domain/timer";

export class CurrentIntervalQueryDto {}

export class CurrentIntervalQueryResultDto {
  readonly timestamp: string;
  readonly duration: string;

  private constructor(timestamp: string, duration: string) {
    this.timestamp = timestamp;
    this.duration = duration;
  }
}

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

export class TimerStoppedEventDto {
  static create({ timestamp }: { timestamp: string }) {
    return new TimerStoppedEventDto(timestamp);
  }

  static fromModel(model: TimerStoppedEvent): TimerStoppedEventDto {
    return TimerStoppedEventDto.create({
      timestamp: model.timestamp.toString(),
    });
  }

  readonly timestamp: string;

  private constructor(timestamp: string) {
    this.timestamp = timestamp;
  }
}

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
