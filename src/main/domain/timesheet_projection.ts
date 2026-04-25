// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  isTimestampInPeriod,
  normalizeDuration,
} from "../../shared/domain/temporal";
import {
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../shared/domain/timesheet_query";
import type { ActivityLoggedEvent } from "./activity_logged_event";
import { Calendar, type Holiday, Vacation } from "./calendar";
import type { Projection } from "./projection";
import { TotalHoursProjection } from "./total_hours_projection";

export class TimesheetProjection implements Projection<TimesheetQueryResult> {
  static create({
    query,
    today = Temporal.Now.plainDateISO("Europe/Berlin"),
    timeZone = "Europe/Berlin",
    capacity = Temporal.Duration.from("PT40H"),
    holidays = [],
    vacations = [],
  }: {
    query: TimesheetQuery;
    today?: Temporal.PlainDate;
    timeZone?: Temporal.TimeZoneLike;
    capacity?: Temporal.Duration;
    holidays?: Holiday[];
    vacations?: Vacation[];
  }) {
    return new TimesheetProjection(
      query,
      today,
      timeZone,
      capacity,
      holidays,
      vacations,
    );
  }

  readonly #query;
  readonly #today;
  readonly #timeZone;
  readonly #capacity;
  readonly #holidays;
  readonly #vacations;
  readonly #timesheetEntryProjection;
  readonly #totalHoursProjection;

  private constructor(
    query: TimesheetQuery,
    today: Temporal.PlainDate,
    timeZone: Temporal.TimeZoneLike,
    capacity: Temporal.Duration,
    holidays: Holiday[],
    vacations: Vacation[],
  ) {
    this.#query = query;
    this.#today = query.today || today;
    this.#timeZone = timeZone;
    this.#capacity = capacity;
    this.#holidays = holidays;
    this.#vacations = vacations;
    this.#timesheetEntryProjection = TimesheetEntryProjection.create({
      timeZone,
    });
    this.#totalHoursProjection = TotalHoursProjection.create();
  }

  update(event: ActivityLoggedEvent) {
    if (
      !isTimestampInPeriod(
        event.timestamp,
        this.#timeZone,
        this.#query.from,
        this.#query.to,
      )
    ) {
      return;
    }

    this.#timesheetEntryProjection.update(event);
    this.#totalHoursProjection.update(event);
  }

  get(): TimesheetQueryResult {
    const entries = this.#timesheetEntryProjection.get();
    const totalHours = this.#totalHoursProjection.get();
    const capacity = this.#determineCapacity(totalHours);
    return TimesheetQueryResult.create({ entries, totalHours, capacity });
  }

  #determineCapacity(totalHours: Temporal.Duration) {
    const calendar = Calendar.create({
      holidays: this.#holidays,
      vacations: this.#vacations,
      capacity: this.#capacity,
    });
    let end: Temporal.PlainDate;
    const { from, to } = this.#query;
    if (Temporal.PlainDate.compare(this.#today, from) < 0) {
      end = from;
    } else if (Temporal.PlainDate.compare(this.#today, to) > 0) {
      end = to;
    } else {
      end = this.#today;
    }
    const businessDays = calendar.countWorkingHours(from, end);
    const offset = totalHours.subtract(businessDays);
    return {
      hours: calendar.countWorkingHours(from, to),
      offset: normalizeDuration(offset),
    };
  }
}

class TimesheetEntryProjection {
  static create({ timeZone }: { timeZone: Temporal.TimeZoneLike }) {
    return new TimesheetEntryProjection(timeZone);
  }

  readonly #timeZone;
  #entries: TimesheetEntry[];

  private constructor(timeZone: Temporal.TimeZoneLike) {
    this.#timeZone = timeZone;
    this.#entries = [];
  }

  update(event: ActivityLoggedEvent) {
    const date = event.timestamp
      .toZonedDateTimeISO(this.#timeZone)
      .toPlainDate();
    const index = this.#entries.findIndex(
      (entry) =>
        Temporal.PlainDate.compare(entry.date, date.toString()) === 0 &&
        entry.client === event.client &&
        entry.project === event.project &&
        entry.task === event.task,
    );
    if (index === -1) {
      const newEntry = TimesheetEntry.create({
        ...event,
        date,
        hours: event.duration,
      });
      this.#entries.push(newEntry);
    } else {
      const existingEntry = this.#entries[index]!;
      const accumulatedHours = existingEntry.hours.add(event.duration);
      this.#entries[index] = TimesheetEntry.create({
        ...existingEntry,
        hours: normalizeDuration(accumulatedHours),
      });
    }
  }

  get() {
    return this.#entries.sort((entry1, entry2) => {
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
}
