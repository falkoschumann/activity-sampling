// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { HolidayState } from "./holiday.aggregate";

export interface HolidaysChangedEvent {
  readonly type: "holidays-changed";
  readonly data: HolidaysChangedEventData;
}

export type HolidaysChangedEventData = Readonly<{
  holidays: HolidayState[];
}>;

export function createHolidaysChangedEvent({
  holidays,
}: {
  holidays: HolidayState[];
}): HolidaysChangedEvent {
  return {
    type: "holidays-changed",
    data: { holidays },
  };
}
