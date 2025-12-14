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
    default:
      throw new Error(`Unknown scope: ${query.scope}`);
  }
  // TODO replace activity projection with event projection
  const activities = await projectActivities(replay, query.from, query.to);
  for await (const activity of activities) {
    projection.update(activity);
    totalHoursProjection.update(activity);
  }
  return {
    entries: projection.get(),
    totalHours: totalHoursProjection.get(),
  };
}

// TODO extract helper function

async function* filterEvents(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  from?: Temporal.PlainDate | Temporal.PlainDateLike | string,
  to?: Temporal.PlainDate | Temporal.PlainDateLike | string,
): AsyncGenerator<ActivityLoggedEvent> {
  for await (const event of replay) {
    const date = event.dateTime.toPlainDate();
    if (from && Temporal.PlainDate.compare(date, from) < 0) {
      continue;
    }
    if (to && Temporal.PlainDate.compare(date, to) > 0) {
      continue;
    }

    yield event;
  }
}

class Activity {
  static create({
    start,
    finish,
    client,
    project,
    task,
    category,
    hours,
  }: {
    start: Temporal.PlainDateLike | string;
    finish: Temporal.PlainDateLike | string;
    client: string;
    project: string;
    task: string;
    category?: string;
    hours: Temporal.DurationLike | string;
  }): Activity {
    return new Activity(start, finish, client, project, task, hours, category);
  }

  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category?: string;
  readonly hours: Temporal.Duration;

  private constructor(
    start: Temporal.PlainDateLike | string,
    finish: Temporal.PlainDateLike | string,
    client: string,
    project: string,
    task: string,
    hours: Temporal.DurationLike | string,
    category?: string,
  ) {
    this.start = Temporal.PlainDate.from(start);
    this.finish = Temporal.PlainDate.from(finish);
    this.client = client;
    this.project = project;
    this.task = task;
    this.category = category;
    this.hours = Temporal.Duration.from(hours);
  }
}

export async function projectActivities(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  from?: Temporal.PlainDateLike | string,
  to?: Temporal.PlainDateLike | string,
): Promise<Activity[]> {
  const activities: Activity[] = [];
  for await (const event of filterEvents(replay, from, to)) {
    const date = event.dateTime.toPlainDate();
    const index = activities.findIndex(
      (activity) =>
        activity.client === event.client &&
        activity.project === event.project &&
        activity.task === event.task &&
        activity.category === event.category,
    );
    if (index === -1) {
      const activity = Activity.create({
        start: date,
        finish: date,
        client: event.client,
        project: event.project,
        task: event.task,
        category: event.category,
        hours: event.duration,
      });
      activities.push(activity);
    } else {
      const activity = activities[index];
      let start = activity.start;
      let finish = activity.finish;
      if (Temporal.PlainDate.compare(date, start) < 0) {
        start = date;
      }
      if (Temporal.PlainDate.compare(date, finish) > 0) {
        finish = date;
      }
      const accumulatedHours = activity.hours.add(event.duration);
      activities[index] = {
        ...activity,
        start,
        finish,
        hours: normalizeDuration(accumulatedHours),
      };
    }
  }
  return activities;
}

class ClientReportProjection {
  #entries: ReportEntry[] = [];

  update(activity: Activity) {
    const index = this.#entries.findIndex(
      (entry) => entry.client === activity.client,
    );
    if (index == -1) {
      this.#entries.push(
        ReportEntry.create({
          start: activity.start,
          finish: activity.finish,
          client: activity.client,
          hours: activity.hours,
          cycleTime: activity.finish.since(activity.start).total("days") + 1,
        }),
      );
    } else {
      this.#entries[index] = updateEntry(this.#entries[index], activity);
    }
  }

  get() {
    return this.#entries.sort((a, b) => a.client.localeCompare(b.client));
  }
}

class ProjectReportProjection {
  #entries: ReportEntry[] = [];

  update(activity: Activity) {
    const index = this.#entries.findIndex(
      (entry) => entry.project === activity.project,
    );
    if (index == -1) {
      this.#entries.push(
        ReportEntry.create({
          start: activity.start,
          finish: activity.finish,
          client: activity.client,
          project: activity.project,
          hours: activity.hours,
          cycleTime: activity.finish.since(activity.start).total("days") + 1,
        }),
      );
    } else {
      this.#entries[index] = updateEntry(
        this.#entries[index],
        activity,
        "client",
      );
    }
  }

  get() {
    return this.#entries.sort((a, b) => {
      const projectComparison = a.project.localeCompare(b.project);
      if (projectComparison !== 0) {
        return projectComparison;
      }

      return a.client.localeCompare(b.client);
    });
  }
}

class TaskReportProjection {
  #entries: ReportEntry[] = [];

  update(activity: Activity) {
    const index = this.#entries.findIndex(
      (entry) =>
        entry.task === activity.task &&
        entry.project === activity.project &&
        entry.client === activity.client,
    );
    if (index == -1) {
      this.#entries.push(
        ReportEntry.create({
          start: activity.start,
          finish: activity.finish,
          client: activity.client,
          project: activity.project,
          task: activity.task,
          category: activity.category,
          hours: activity.hours,
          cycleTime: activity.finish.since(activity.start).total("days") + 1,
        }),
      );
    } else {
      this.#entries[index] = updateEntry(
        this.#entries[index],
        activity,
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

      const clientComparison = a.client.localeCompare(b.client);
      if (clientComparison !== 0) {
        return clientComparison;
      }

      return a.category.localeCompare(b.category);
    });
  }
}

class CategoryReportProjection {
  #entries: ReportEntry[] = [];

  update(activity: Activity) {
    const index = this.#entries.findIndex(
      (entry) => entry.category === (activity.category ?? ""),
    );
    if (index == -1) {
      this.#entries.push(
        ReportEntry.create({
          start: activity.start,
          finish: activity.finish,
          category: activity.category,
          hours: activity.hours,
          cycleTime: activity.finish.since(activity.start).total("days") + 1,
        }),
      );
    } else {
      this.#entries[index] = updateEntry(this.#entries[index], activity);
    }
  }

  get() {
    return this.#entries.sort((a, b) => a.category.localeCompare(b.category));
  }
}

function updateEntry(
  entry: ReportEntry,
  activity: Activity,
  groupBy?: "client" | "category",
): ReportEntry {
  const start =
    Temporal.PlainDate.compare(activity.start, entry.start) < 0
      ? activity.start
      : entry.start;
  const finish =
    Temporal.PlainDate.compare(activity.finish, entry.finish) < 0
      ? entry.finish
      : activity.finish;
  const cycleTime = finish.since(start).total("days") + 1;
  const accumulatedHours = entry.hours.add(activity.hours);
  const updatedEntry = {
    ...entry,
    start,
    finish,
    hours: normalizeDuration(accumulatedHours),
    cycleTime,
  };
  if (
    groupBy != null &&
    activity[groupBy] != null &&
    !updatedEntry[groupBy].includes(activity[groupBy])
  ) {
    let groups = updatedEntry[groupBy].split(", ");
    groups.push(activity[groupBy]);
    groups = groups.sort();
    updatedEntry[groupBy] = groups.join(", ");
  }
  return ReportEntry.create(updatedEntry);
}

class TotalHoursProjection {
  #totalHours = Temporal.Duration.from("PT0S");

  update(activity: Activity) {
    this.#totalHours = this.#totalHours.add(activity.hours);
  }

  get() {
    return normalizeDuration(this.#totalHours);
  }
}
