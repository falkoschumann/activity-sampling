// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { TimerStoppedEvent } from "../domain/timer_stopped_event";

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
