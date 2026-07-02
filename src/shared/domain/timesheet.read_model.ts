// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { HolidaysChangedEvent } from "./holiday/holidays_changed.event";
import type { HolidayState } from "./holiday/holiday.aggregate";
import { ActivityLoggedEvent } from "./activity/activity_logged.event";
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
  timestamp: Temporal.PlainDateTime;
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
  { timeZone }: { timeZone: Temporal.TimeZoneLike },
): TimesheetView {
  if (event instanceof ActivityLoggedEvent) {
    const newEntry: TimesheetViewEntry = {
      timestamp: event.data.timestamp
        .toZonedDateTimeISO(timeZone)
        .toPlainDateTime(),
      duration: event.data.duration,
      client: event.data.client,
      project: event.data.project,
      task: event.data.task,
      notes: event.data.notes,
      category: event.data.category,
    };
    const entries = [...view.entries, newEntry];
    entries.sort((a, b) =>
      Temporal.PlainDateTime.compare(a.timestamp, b.timestamp),
    );
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
