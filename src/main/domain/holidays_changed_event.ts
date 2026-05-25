// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Holiday } from "./calendar";

export class HolidaysChangedEvent {
  static create({ holidays }: { holidays: Holiday[] }) {
    return new HolidaysChangedEvent(holidays);
  }

  readonly holidays: Holiday[];

  private constructor(holidays: Holiday[]) {
    this.holidays = holidays;
  }
}
