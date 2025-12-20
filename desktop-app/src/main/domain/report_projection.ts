// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  ActivityLoggedEvent,
  ReportEntry,
  ReportQuery,
  ReportQueryResult,
  ReportScope,
} from "../../shared/domain/activities";
import { normalizeDuration } from "../../shared/common/temporal";
import { filterEvents, TotalHoursProjection } from "./activities";

export async function projectReport(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  query: ReportQuery,
): Promise<ReportQueryResult> {
  let projection;
  const totalHoursProjection = new TotalHoursProjection();
  switch (query.scope) {
    case ReportScope.CLIENTS:
      projection = new ClientReportProjection();
      break;
    case ReportScope.PROJECTS:
      projection = new ProjectReportProjection();
      break;
    case ReportScope.TASKS:
      projection = new TaskReportProjection();
      break;
    case ReportScope.CATEGORIES:
      projection = new CategoryReportProjection();
      break;
  }
  for await (const event of filterEvents(replay, query.from, query.to)) {
    projection.update(event);
    totalHoursProjection.update(event);
  }
  return {
    entries: projection.get(),
    totalHours: totalHoursProjection.get(),
  };
}

class ClientReportProjection {
  #entries: ReportEntry[] = [];

  update(event: ActivityLoggedEvent) {
    const index = this.#entries.findIndex(
      (entry) => entry.client === event.client,
    );
    if (index == -1) {
      const date = event.dateTime.toPlainDate();
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
      this.#entries[index] = updateEntry(this.#entries[index], event);
    }
  }

  get() {
    return this.#entries.sort((a, b) => a.client.localeCompare(b.client));
  }
}

class ProjectReportProjection {
  #entries: ReportEntry[] = [];

  update(event: ActivityLoggedEvent) {
    const index = this.#entries.findIndex(
      (entry) => entry.project === event.project,
    );
    if (index == -1) {
      const date = event.dateTime.toPlainDate();
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
      this.#entries[index] = updateEntry(this.#entries[index], event, "client");
    }
  }

  get() {
    return this.#entries.sort((a, b) => a.project.localeCompare(b.project));
  }
}

class TaskReportProjection {
  #entries: ReportEntry[] = [];

  update(event: ActivityLoggedEvent) {
    const index = this.#entries.findIndex(
      (entry) =>
        entry.task === event.task &&
        entry.project === event.project &&
        entry.client === event.client,
    );
    if (index == -1) {
      const date = event.dateTime.toPlainDate();
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
        this.#entries[index],
        event,
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

class CategoryReportProjection {
  #entries: ReportEntry[] = [];

  update(event: ActivityLoggedEvent) {
    const index = this.#entries.findIndex(
      (entry) => entry.category === (event.category ?? "N/A"),
    );
    if (index == -1) {
      const date = event.dateTime.toPlainDate();
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
      this.#entries[index] = updateEntry(this.#entries[index], event);
    }
  }

  get() {
    return this.#entries.sort((a, b) => a.category.localeCompare(b.category));
  }
}

function updateEntry(
  entry: ReportEntry,
  event: ActivityLoggedEvent,
  groupBy?: "client" | "category",
): ReportEntry {
  const date = event.dateTime.toPlainDate();
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
