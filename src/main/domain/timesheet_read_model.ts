// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  isTimestampInPeriod,
  normalizeDuration,
} from "../../shared/domain/temporal";
import {
  TimesheetEntry,
  type TimesheetQuery,
  TimesheetQueryResult,
} from "../../shared/domain/timesheet_query";
import { ActivityLoggedEvent } from "./activity_logged_event";
import { Calendar, type Holiday, Vacation } from "./calendar";
import { CapacityChangedEvent } from "./capacity_changed_event";
import { HolidaysChangedEvent } from "./holidays_changed_event";
import { VacationChangedEvent } from "./vacation_changed_event";

export type TimesheetReadModel = {
  entries: TimesheetReadModelEntry[];
  holidays: Holiday[];
  vacations: Vacation[];
  capacity: Temporal.Duration;
};

// TODO rename to TimesheetEntry
export type TimesheetReadModelEntry = {
  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;
};

export const initialTimesheetReadModel: TimesheetReadModel = {
  entries: [],
  holidays: [],
  vacations: [],
  capacity: Temporal.Duration.from("PT40H"),
};

export function projectTimesheet(
  readModel: TimesheetReadModel = initialTimesheetReadModel,
  event:
    | ActivityLoggedEvent
    | CapacityChangedEvent
    | HolidaysChangedEvent
    | VacationChangedEvent,
): TimesheetReadModel {
  if (event instanceof ActivityLoggedEvent) {
    const entries = [...readModel.entries, event];
    entries.sort((a, b) => Temporal.Instant.compare(a.timestamp, b.timestamp));
    return { ...readModel, entries };
  } else if (event instanceof HolidaysChangedEvent) {
    return { ...readModel, holidays: event.holidays };
  } else if (event instanceof VacationChangedEvent) {
    return { ...readModel, vacations: event.vacations };
  } else if (event instanceof CapacityChangedEvent) {
    return { ...readModel, capacity: event.capacity };
  } else {
    return readModel;
  }
}

export function queryTimesheet(
  readModel: TimesheetReadModel,
  query: Required<TimesheetQuery>,
): TimesheetQueryResult {
  const entries = createEntries(readModel, query);
  const totalHours = sumTotalHours(entries);
  const calendar = Calendar.create(readModel);
  const capacity = determineCapacity(calendar, totalHours, query);
  return TimesheetQueryResult.create({ entries, capacity, totalHours });
}

function createEntries(
  readModel: TimesheetReadModel,
  query: Required<TimesheetQuery>,
) {
  const entries: TimesheetEntry[] = [];
  for (const entry of readModel.entries) {
    updateEntries(entries, entry, query);
  }
  entries.sort(TimesheetEntry.compare);
  return entries;
}

function updateEntries(
  entries: TimesheetEntry[],
  entry: TimesheetReadModelEntry,
  { from, to, timeZone }: Required<TimesheetQuery>,
) {
  if (!isTimestampInPeriod(entry.timestamp, timeZone, from, to)) {
    return;
  }

  const date = entry.timestamp.toZonedDateTimeISO(timeZone).toPlainDate();
  const index = entries.findIndex(
    (e) =>
      Temporal.PlainDate.compare(e.date, date.toString()) === 0 &&
      e.client === entry.client &&
      e.project === entry.project &&
      e.task === entry.task,
  );
  if (index === -1) {
    const newEntry = TimesheetEntry.create({
      ...entry,
      date,
      hours: entry.duration,
    });
    entries.push(newEntry);
  } else {
    const existingEntry = entries[index]!;
    const accumulatedHours = normalizeDuration(
      existingEntry.hours.add(entry.duration),
    );
    entries[index] = TimesheetEntry.create({
      ...existingEntry,
      hours: accumulatedHours,
    });
  }
}

function sumTotalHours(entries: TimesheetEntry[]) {
  return entries.reduce(
    (total, entry) => total.add(entry.hours),
    Temporal.Duration.from("PT0S"),
  );
}

function determineCapacity(
  calendar: Calendar,
  totalHours: Temporal.Duration,
  { from, to, today }: Required<TimesheetQuery>,
) {
  const hours = calendar.countWorkingHours(from, to);

  let end: Temporal.PlainDate;
  if (Temporal.PlainDate.compare(today, from) < 0) {
    end = from;
  } else if (Temporal.PlainDate.compare(today, to) > 0) {
    end = to;
  } else {
    end = today;
  }
  const businessDays = calendar.countWorkingHours(from, end);
  const offset = normalizeDuration(totalHours.subtract(businessDays));

  return { hours, offset };
}
