// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { HolidayState } from "./holiday.aggregate";

export class HolidaysChangedEvent {
  static create({ holidays }: { holidays: HolidayState[] }) {
    return new HolidaysChangedEvent(holidays);
  }

  readonly holidays: HolidayState[];

  private constructor(holidays: HolidayState[]) {
    this.holidays = holidays;
  }
}
