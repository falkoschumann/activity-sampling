// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class StartTimerCommandDto {
  readonly interval: string;

  constructor(interval: string) {
    this.interval = interval;
  }
}

export class StopTimerCommandDto {}

export class CurrentIntervalQueryDto {}

export class CurrentIntervalQueryResultDto {
  readonly timestamp: string;
  readonly duration: string;

  constructor(timestamp: string, duration: string) {
    this.timestamp = timestamp;
    this.duration = duration;
  }
}

export class TimerStartedEventDto {
  readonly timestamp: string;
  readonly interval: string;

  constructor(timestamp: string, interval: string) {
    this.timestamp = timestamp;
    this.interval = interval;
  }
}

export class TimerStoppedEventDto {
  readonly timestamp: string;

  constructor(timestamp: string) {
    this.timestamp = timestamp;
  }
}

export class IntervalElapsedEventDto {
  readonly timestamp: string;
  readonly interval: string;

  constructor(timestamp: string, interval: string) {
    this.timestamp = timestamp;
    this.interval = interval;
  }
}
