// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { Calendar, type Holiday, Vacation } from "./calendar";
import { normalizeDuration } from "../../shared/common/temporal";
import {
  ActivityLoggedEvent,
  TimesheetEntry,
  TimesheetQuery,
  TimesheetQueryResult,
} from "../../shared/domain/activities";
import { filterEvents, TotalHoursProjection } from "./activities";

export async function projectTimesheet(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  query: TimesheetQuery,
  options?: {
    capacity?: Temporal.Duration;
    holidays?: Holiday[];
    vacations?: Vacation[];
  },
): Promise<TimesheetQueryResult> {
  const timesheetProjection = new TimesheetProjection();
  const totalHoursProjection = new TotalHoursProjection();
  for await (const event of filterEvents(replay, query.from, query.to)) {
    timesheetProjection.update(event);
    totalHoursProjection.update(event);
  }
  const totalHours = totalHoursProjection.get();
  const today = query.today
    ? query.today
    : Temporal.Now.plainDateISO(query.timeZone);
  const capacity = determineCapacity({
    ...query,
    today,
    totalHours,
    ...options,
  });
  return {
    entries: timesheetProjection.get(),
    totalHours,
    capacity,
  };
}

class TimesheetProjection {
  #entries: TimesheetEntry[] = [];

  update(event: ActivityLoggedEvent) {
    const date = event.dateTime.toPlainDate();
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
      const existingEntry = this.#entries[index];
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

function determineCapacity({
  from,
  to,
  today,
  totalHours,
  capacity = Temporal.Duration.from("PT40H"),
  holidays = [],
  vacations = [],
}: {
  from: Temporal.PlainDate;
  to: Temporal.PlainDate;
  today: Temporal.PlainDate;
  totalHours: Temporal.Duration;
  capacity?: Temporal.Duration;
  holidays?: Holiday[];
  vacations?: Vacation[];
}) {
  const calendar = Calendar.create({ holidays, vacations, capacity });
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
