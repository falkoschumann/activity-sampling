// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { HolidaysChangedEvent } from "./holiday/holidays_changed.event";
import type { HolidayState } from "./holiday/holiday.aggregate";
import { ActivityLoggedEvent } from "./logged-activity/activity_logged.event";
import { SettingsChangedEvent } from "./settings/settings_changed.event";
import { VacationsChangedEvent } from "./vacation/vacations_changed.event";
import type { VacationState } from "./vacation/vacation.aggregate";

export type TimesheetView = {
  entries: TimesheetViewEntry[];
  holidays: HolidayState[];
  vacations: VacationState[];
  capacity: Temporal.Duration;
  categories: string[];
};

export type TimesheetViewEntry = Readonly<{
  timestamp: Temporal.Instant;
  duration: Temporal.Duration;
  client: string;
  project: string;
  task: string;
  notes?: string;
  category?: string;
}>;

export function createTimesheet(): TimesheetView {
  return {
    entries: [],
    holidays: [],
    vacations: [],
    capacity: Temporal.Duration.from("PT40H"),
    categories: [],
  };
}

export function projectTimesheet(
  view: TimesheetView,
  event:
    | ActivityLoggedEvent
    | HolidaysChangedEvent
    | SettingsChangedEvent
    | VacationsChangedEvent,
): TimesheetView {
  if (event instanceof ActivityLoggedEvent) {
    const entries = [...view.entries, event.data];
    entries.sort((a, b) => Temporal.Instant.compare(a.timestamp, b.timestamp));
    return { ...view, entries };
  } else if (event instanceof HolidaysChangedEvent) {
    return { ...view, holidays: event.holidays };
  } else if (event instanceof VacationsChangedEvent) {
    return { ...view, vacations: event.vacations };
  } else if (event instanceof SettingsChangedEvent) {
    return {
      ...view,
      capacity: event.data.capacity,
      categories: event.data.categories,
    };
  } else {
    return view;
  }
}
