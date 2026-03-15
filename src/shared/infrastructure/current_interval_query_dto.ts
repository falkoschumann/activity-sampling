// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

export class CurrentIntervalQueryDto {}

export class CurrentIntervalQueryResultDto {
  readonly timestamp: string;
  readonly duration: string;

  private constructor(timestamp: string, duration: string) {
    this.timestamp = timestamp;
    this.duration = duration;
  }
}
