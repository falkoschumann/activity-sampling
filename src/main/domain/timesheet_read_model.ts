// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

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
import {
  isTimestampInPeriod,
  normalizeDuration,
} from "../../shared/domain/temporal";

export class TimesheetReadModel {
  #entries: Entry[] = [];
  #holidays: Holiday[] = [];
  #vacations: Vacation[] = [];
  #capacity: Temporal.Duration = Temporal.Duration.from("PT40H");

  project(
    event:
      | ActivityLoggedEvent
      | CapacityChangedEvent
      | HolidaysChangedEvent
      | VacationChangedEvent,
  ) {
    if (event instanceof ActivityLoggedEvent) {
      this.#entries.push(event);
      this.#entries.sort((a, b) =>
        Temporal.Instant.compare(a.timestamp, b.timestamp),
      );
    } else if (event instanceof CapacityChangedEvent) {
      this.#capacity = event.capacity;
    } else if (event instanceof HolidaysChangedEvent) {
      this.#holidays = event.holidays;
    } else if (event instanceof VacationChangedEvent) {
      this.#vacations = event.vacations;
    }
  }

  queryTimesheet(query: Required<TimesheetQuery>): TimesheetQueryResult {
    const entries: TimesheetEntry[] = [];
    let totalHours = Temporal.Duration.from("PT0S");
    for (const entry of this.#entries) {
      if (
        !isTimestampInPeriod(
          entry.timestamp,
          query.timeZone,
          query.from,
          query.to,
        )
      ) {
        continue;
      }

      this.#updateEntries(entries, entry, query.timeZone);
      totalHours = totalHours.add(entry.duration);
    }
    this.#sortEntries(entries);
    totalHours = normalizeDuration(totalHours);
    const capacity = this.#determineCapacity(
      query.from,
      query.to,
      query.today,
      totalHours,
    );
    return TimesheetQueryResult.create({ entries, capacity, totalHours });
  }

  #updateEntries(
    entries: TimesheetEntry[],
    entry: Entry,
    timeZone: Temporal.TimeZoneLike,
  ) {
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
      const accumulatedHours = existingEntry.hours.add(entry.duration);
      entries[index] = TimesheetEntry.create({
        ...existingEntry,
        hours: normalizeDuration(accumulatedHours),
      });
    }
  }

  #sortEntries(entries: TimesheetEntry[]) {
    return entries.sort((entry1, entry2) => {
      const dateComparison = Temporal.PlainDate.compare(
        entry1.date,
        entry2.date,
      );
      if (dateComparison !== 0) {
        return dateComparison;
      }
      if (entry1.client !== entry2.client) {
        return entry1.client.localeCompare(entry2.client);
      }
      if (entry1.project !== entry2.project) {
        return entry1.project.localeCompare(entry2.project);
      }
      return entry1.task.localeCompare(entry2.task);
    });
  }

  #determineCapacity(
    from: Temporal.PlainDate,
    to: Temporal.PlainDate,
    today: Temporal.PlainDate,
    totalHours: Temporal.Duration,
  ) {
    const calendar = Calendar.create({
      holidays: this.#holidays,
      vacations: this.#vacations,
      capacity: this.#capacity,
    });
    let end: Temporal.PlainDate;
    if (Temporal.PlainDate.compare(today, from) < 0) {
      end = from;
    } else if (Temporal.PlainDate.compare(today, to) > 0) {
      end = to;
    } else {
      end = today;
    }
    const businessDays = calendar.countWorkingHours(from, end);
    const offset = totalHours.subtract(businessDays);
    return {
      hours: calendar.countWorkingHours(from, to),
      offset: normalizeDuration(offset),
    };
  }
}

type Entry = {
  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;
};
