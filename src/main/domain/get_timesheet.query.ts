// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { normalizeDuration } from "../../shared/domain/temporal";

import type { TimesheetView, TimesheetViewEntry } from "./timesheet.read_model";
import {
  type GetTimesheetQuery,
  GetTimesheetQueryResult,
} from "../../shared/domain/get_timesheet.query";
import { TimesheetEntry } from "../../shared/domain/timesheet_entry";
import { countWorkingHours } from "./calendar.service";

export function getTimesheet(
  view: TimesheetView,
  query: GetTimesheetQuery,
): GetTimesheetQueryResult {
  // we assume the view is pre-filtered by from and to date
  const entries = createEntries(view);
  const totalHours = sumTotalHours(entries);
  const capacity = determineCapacity(view, query, totalHours);
  return GetTimesheetQueryResult.create({ entries, capacity, totalHours });
}

function createEntries(readModel: TimesheetView) {
  const entries: TimesheetEntry[] = [];
  for (const entry of readModel.entries) {
    updateEntries(entries, entry);
  }
  entries.sort(TimesheetEntry.compare);
  return entries;
}

function updateEntries(entries: TimesheetEntry[], entry: TimesheetViewEntry) {
  const date = entry.timestamp.toPlainDate();
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
  view: TimesheetView,
  query: GetTimesheetQuery,
  totalHours: Temporal.Duration,
) {
  const { from, to, today } = query.data;
  const hours = countWorkingHours(from, to, view);

  let end: Temporal.PlainDate;
  if (Temporal.PlainDate.compare(today, from) < 0) {
    end = from;
  } else if (Temporal.PlainDate.compare(today, to) > 0) {
    end = to;
  } else {
    end = today;
  }
  const businessDays = countWorkingHours(from, end, view);
  const offset = normalizeDuration(totalHours.subtract(businessDays));

  return { hours, offset };
}
