// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ActivityLoggedEvent } from "../activity/activity_logged.event";
import type { HolidayState } from "../holiday/holiday.aggregate";
import type { HolidaysChangedEvent } from "../holiday/holidays_changed.event";
import type { SettingsChangedEvent } from "../settings/settings_changed.event";
import type { VacationState } from "../vacation/vacation.aggregate";
import type { VacationsChangedEvent } from "../vacation/vacations_changed.event";
import type { TimesheetViewEntry } from "../value_objects/timesheet_view_entry.value_object";

export interface TimesheetView {
  readonly entries: TimesheetViewEntry[];
  readonly holidays: HolidayState[];
  readonly vacations: VacationState[];
  readonly capacity: Temporal.DurationLike;
  readonly categories: string[];
}

export function createTimesheet(): TimesheetView {
  return {
    entries: [],
    holidays: [],
    vacations: [],
    capacity: "PT40H",
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
  switch (event.type) {
    case "activity-logged": {
      const newEntry: TimesheetViewEntry = {
        timestamp: Temporal.Instant.from(event.data.timestamp)
          .toZonedDateTimeISO(timeZone)
          .toPlainDateTime()
          .toString(),
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
    }
    case "holidays-changed":
      return { ...view, holidays: event.data.holidays };
    case "change-settings":
      return {
        ...view,
        capacity: event.data.capacity,
        categories: event.data.categories,
      };
    case "vacations-changed":
      return { ...view, vacations: event.data.vacations };
    default:
      return view;
  }
}
