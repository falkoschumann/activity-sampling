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
import { Calendar } from "./calendar";
import type {
  TimesheetReadModel,
  TimesheetReadModelEntry,
} from "./timesheet_read_model";

export function queryTimesheet(
  readModel: TimesheetReadModel,
  query: TimesheetQuery,
): TimesheetQueryResult {
  const entries = createEntries(readModel, query);
  const totalHours = sumTotalHours(entries);
  const calendar = Calendar.create(readModel);
  const capacity = determineCapacity(calendar, totalHours, query);
  return TimesheetQueryResult.create({ entries, capacity, totalHours });
}

function createEntries(readModel: TimesheetReadModel, query: TimesheetQuery) {
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
  { from, to, timeZone }: TimesheetQuery,
) {
  if (
    !isTimestampInPeriod({ timestamp: entry.timestamp, timeZone, from, to })
  ) {
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
  { from, to, today }: TimesheetQuery,
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
