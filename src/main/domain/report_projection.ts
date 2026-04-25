// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  ReportScope,
} from "../../shared/domain/report_query";
import {
  isTimestampInPeriod,
  normalizeDuration,
} from "../../shared/domain/temporal";
import type { ActivityLoggedEvent } from "./activity_logged_event";
import type { Projection } from "./projection";
import { TotalHoursProjection } from "./total_hours_projection";

export class ReportProjection implements Projection<ReportQueryResult> {
  static create({
    query,
    timeZone = "Europe/Berlin",
  }: {
    query: ReportQuery;
    timeZone?: Temporal.TimeZoneLike;
  }) {
    return new ReportProjection(query, timeZone);
  }

  readonly #query;
  readonly #timeZone;
  readonly #reportEntryProjection;
  readonly #totalHoursProjection;

  private constructor(query: ReportQuery, timeZone: Temporal.TimeZoneLike) {
    this.#query = query;
    this.#timeZone = timeZone;
    switch (query.scope) {
      case ReportScope.CLIENTS:
        this.#reportEntryProjection = ClientReportProjection.create({
          timeZone,
        });
        break;
      case ReportScope.PROJECTS:
        this.#reportEntryProjection = ProjectReportProjection.create({
          timeZone,
        });
        break;
      case ReportScope.TASKS:
        this.#reportEntryProjection = TaskReportProjection.create({ timeZone });
        break;
      case ReportScope.CATEGORIES:
        this.#reportEntryProjection = CategoryReportProjection.create({
          timeZone,
        });
        break;
    }
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

    this.#reportEntryProjection.update(event);
    this.#totalHoursProjection.update(event);
  }

  get(): ReportQueryResult {
    const entries = this.#reportEntryProjection.get();
    const totalHours = this.#totalHoursProjection.get();
    return ReportQueryResult.create({ entries, totalHours });
  }
}

class ClientReportProjection implements Projection<ReportEntry[]> {
  static create({ timeZone }: { timeZone: Temporal.TimeZoneLike }) {
    return new ClientReportProjection(timeZone);
  }

  readonly #timeZone;
  #entries: ReportEntry[];

  private constructor(timeZone: Temporal.TimeZoneLike) {
    this.#timeZone = timeZone;
    this.#entries = [];
  }

  update(event: ActivityLoggedEvent) {
    const index = this.#entries.findIndex(
      (entry) => entry.client === event.client,
    );
    if (index == -1) {
      const date = event.timestamp
        .toZonedDateTimeISO(this.#timeZone)
        .toPlainDate();
      this.#entries.push(
        ReportEntry.create({
          start: date,
          finish: date,
          client: event.client,
          hours: event.duration,
          cycleTime: 1,
        }),
      );
    } else {
      this.#entries[index] = updateEntry(
        this.#entries[index]!,
        event,
        this.#timeZone,
      );
    }
  }

  get() {
    return this.#entries.sort((a, b) => a.client.localeCompare(b.client));
  }
}

class ProjectReportProjection implements Projection<ReportEntry[]> {
  static create({ timeZone }: { timeZone: Temporal.TimeZoneLike }) {
    return new ProjectReportProjection(timeZone);
  }

  #timeZone;
  #entries: ReportEntry[];

  private constructor(timeZone: Temporal.TimeZoneLike) {
    this.#timeZone = timeZone;
    this.#entries = [];
  }

  update(event: ActivityLoggedEvent) {
    const index = this.#entries.findIndex(
      (entry) => entry.project === event.project,
    );
    if (index == -1) {
      const date = event.timestamp
        .toZonedDateTimeISO(this.#timeZone)
        .toPlainDate();
      this.#entries.push(
        ReportEntry.create({
          start: date,
          finish: date,
          client: event.client,
          project: event.project,
          hours: event.duration,
          cycleTime: 1,
        }),
      );
    } else {
      this.#entries[index] = updateEntry(
        this.#entries[index]!,
        event,
        this.#timeZone,
        "client",
      );
    }
  }

  get() {
    return this.#entries.sort((a, b) => a.project.localeCompare(b.project));
  }
}

class TaskReportProjection implements Projection<ReportEntry[]> {
  static create({ timeZone }: { timeZone: Temporal.TimeZoneLike }) {
    return new TaskReportProjection(timeZone);
  }

  #timeZone;
  #entries: ReportEntry[];

  private constructor(timeZone: Temporal.TimeZoneLike) {
    this.#timeZone = timeZone;
    this.#entries = [];
  }

  update(event: ActivityLoggedEvent) {
    const index = this.#entries.findIndex(
      (entry) =>
        entry.task === event.task &&
        entry.project === event.project &&
        entry.client === event.client,
    );
    if (index == -1) {
      const date = event.timestamp
        .toZonedDateTimeISO(this.#timeZone)
        .toPlainDate();
      this.#entries.push(
        ReportEntry.create({
          start: date,
          finish: date,
          client: event.client,
          project: event.project,
          task: event.task,
          category: event.category,
          hours: event.duration,
          cycleTime: 1,
        }),
      );
    } else {
      this.#entries[index] = updateEntry(
        this.#entries[index]!,
        event,
        this.#timeZone,
        "category",
      );
    }
  }

  get() {
    return this.#entries.sort((a, b) => {
      const taskComparison = a.task.localeCompare(b.task);
      if (taskComparison !== 0) {
        return taskComparison;
      }

      const projectComparison = a.project.localeCompare(b.project);
      if (projectComparison !== 0) {
        return projectComparison;
      }

      return a.client.localeCompare(b.client);
    });
  }
}

class CategoryReportProjection implements Projection<ReportEntry[]> {
  static create({ timeZone }: { timeZone: Temporal.TimeZoneLike }) {
    return new CategoryReportProjection(timeZone);
  }

  #timeZone;
  #entries: ReportEntry[];

  private constructor(timeZone: Temporal.TimeZoneLike) {
    this.#timeZone = timeZone;
    this.#entries = [];
  }

  update(event: ActivityLoggedEvent) {
    const index = this.#entries.findIndex(
      (entry) => entry.category === (event.category ?? "N/A"),
    );
    if (index == -1) {
      const date = event.timestamp
        .toZonedDateTimeISO(this.#timeZone)
        .toPlainDate();
      this.#entries.push(
        ReportEntry.create({
          start: date,
          finish: date,
          category: event.category,
          hours: event.duration,
          cycleTime: 1,
        }),
      );
    } else {
      this.#entries[index] = updateEntry(
        this.#entries[index]!,
        event,
        this.#timeZone,
      );
    }
  }

  get() {
    return this.#entries.sort((a, b) => a.category.localeCompare(b.category));
  }
}

function updateEntry(
  entry: ReportEntry,
  event: ActivityLoggedEvent,
  timeZone: Temporal.TimeZoneLike,
  groupBy?: "client" | "category",
): ReportEntry {
  const date = event.timestamp.toZonedDateTimeISO(timeZone).toPlainDate();
  const start =
    Temporal.PlainDate.compare(date, entry.start) < 0 ? date : entry.start;
  const finish =
    Temporal.PlainDate.compare(date, entry.finish) < 0 ? entry.finish : date;
  const cycleTime = finish.since(start).total("days") + 1;
  const accumulatedHours = entry.hours.add(event.duration);
  const updatedEntry = {
    ...entry,
    start,
    finish,
    hours: normalizeDuration(accumulatedHours),
    cycleTime,
  };
  if (
    groupBy != null &&
    event[groupBy] != null &&
    !updatedEntry[groupBy].includes(event[groupBy])
  ) {
    let groups = updatedEntry[groupBy].split(", ");
    groups.push(event[groupBy]);
    groups = groups.sort();
    updatedEntry[groupBy] = groups.join(", ");
  }
  return ReportEntry.create(updatedEntry);
}
