// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  ReportEntry,
  type ReportQuery,
  ReportQueryResult,
  ReportScope,
} from "../../shared/domain/report_query";
import { ActivityLoggedEvent } from "./activity_logged_event";
import {
  isTimestampInPeriod,
  normalizeDuration,
} from "../../shared/domain/temporal";

export class ReportReadModel {
  #activities: Activity[] = [];
  #categories: string[] = [];

  project(event: ActivityLoggedEvent) {
    this.#projectActivities(event);
    this.#projectCategories(event);
  }

  queryReport(
    query: Omit<ReportQuery, "timeZone"> & { timeZone: Temporal.TimeZoneLike },
  ): ReportQueryResult {
    const entries: ReportEntry[] = [];
    for (const activity of this.#activities) {
      if (
        !isTimestampInPeriod(
          activity.start,
          query.timeZone,
          query.from,
          query.to,
        )
      ) {
        continue;
      }

      let start = activity.start
        .toZonedDateTimeISO(query.timeZone)
        .toPlainDate();
      let finish = activity.finish
        .toZonedDateTimeISO(query.timeZone)
        .toPlainDate();
      switch (query.scope) {
        case ReportScope.CLIENTS: {
          const index = entries.findIndex(
            (entry) => entry.client === activity.client,
          );
          if (index == -1) {
            entries.push(
              ReportEntry.create({
                start,
                finish,
                client: activity.client,
                hours: activity.hours,
                cycleTime: finish.since(start).total("days") + 1,
              }),
            );
          } else {
            const entry = entries[index]!;
            start =
              Temporal.PlainDate.compare(start, entry.start) < 0
                ? start
                : entry.start;
            finish =
              Temporal.PlainDate.compare(finish, entry.finish) > 0
                ? finish
                : entry.finish;
            entries[index] = ReportEntry.create({
              start,
              finish,
              client: activity.client,
              hours: normalizeDuration(activity.hours.add(entry.hours)),
              cycleTime: finish.since(start).total("days") + 1,
            });
          }
          break;
        }
        case ReportScope.PROJECTS: {
          const index = entries.findIndex(
            (entry) => entry.project === activity.project,
          );
          if (index == -1) {
            entries.push(
              ReportEntry.create({
                start,
                finish,
                client: activity.client,
                project: activity.project,
                hours: activity.hours,
                cycleTime: finish.since(start).total("days") + 1,
              }),
            );
          } else {
            const entry = entries[index]!;
            start =
              Temporal.PlainDate.compare(start, entry.start) < 0
                ? start
                : entry.start;
            finish =
              Temporal.PlainDate.compare(finish, entry.finish) > 0
                ? finish
                : entry.finish;
            let client = entry.client;
            if (!entry.client.includes(activity.client)) {
              const clients = client.split(", ");
              clients.push(activity.client);
              clients.sort();
              client = clients.join(", ");
            }
            entries[index] = ReportEntry.create({
              start,
              finish,
              client,
              project: activity.project,
              hours: normalizeDuration(activity.hours.add(entry.hours)),
              cycleTime: finish.since(start).total("days") + 1,
            });
          }
          break;
        }
        case ReportScope.TASKS: {
          const index = entries.findIndex(
            (entry) =>
              entry.task === activity.task &&
              entry.project === activity.project &&
              entry.client === activity.client,
          );
          if (index == -1) {
            entries.push(
              ReportEntry.create({
                start,
                finish,
                client: activity.client,
                project: activity.project,
                task: activity.task,
                category: activity.category,
                hours: activity.hours,
                cycleTime: finish.since(start).total("days") + 1,
              }),
            );
          } else {
            const entry = entries[index]!;
            start =
              Temporal.PlainDate.compare(start, entry.start) < 0
                ? start
                : entry.start;
            finish =
              Temporal.PlainDate.compare(finish, entry.finish) > 0
                ? finish
                : entry.finish;
            let category = entry.category;
            if (
              entry.category != null &&
              activity.category != null &&
              !entry.category.includes(activity.category)
            ) {
              const categories = category.split(", ");
              categories.push(activity.category);
              categories.sort();
              category = categories.join(", ");
            }
            entries[index] = ReportEntry.create({
              start,
              finish,
              client: activity.client,
              project: activity.project,
              task: activity.task,
              category,
              hours: normalizeDuration(activity.hours.add(entry.hours)),
              cycleTime: finish.since(start).total("days") + 1,
            });
          }
          break;
        }
        case ReportScope.CATEGORIES: {
          const index = entries.findIndex(
            (entry) => entry.category === (activity.category ?? "N/A"),
          );
          if (index == -1) {
            entries.push(
              ReportEntry.create({
                start,
                finish,
                category: activity.category,
                hours: activity.hours,
                cycleTime: finish.since(start).total("days") + 1,
              }),
            );
          } else {
            const entry = entries[index]!;
            start =
              Temporal.PlainDate.compare(start, entry.start) < 0
                ? start
                : entry.start;
            finish =
              Temporal.PlainDate.compare(finish, entry.finish) > 0
                ? finish
                : entry.finish;
            entries[index] = ReportEntry.create({
              start,
              finish,
              category: activity.category,
              hours: normalizeDuration(activity.hours.add(entry.hours)),
              cycleTime: finish.since(start).total("days") + 1,
            });
          }
          break;
        }
      }
    }
    switch (query.scope) {
      case ReportScope.CLIENTS:
        entries.sort((a, b) => a.client.localeCompare(b.client));
        break;
      case ReportScope.PROJECTS:
        entries.sort((a, b) => a.project.localeCompare(b.project));
        break;
      case ReportScope.TASKS:
        entries.sort((a, b) => {
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
        break;
      case ReportScope.CATEGORIES:
        entries.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    let totalHours = entries.reduce(
      (total, entry) => total.add(entry.hours),
      Temporal.Duration.from("PT0S"),
    );
    totalHours = normalizeDuration(totalHours);

    return ReportQueryResult.create({ entries, totalHours });
  }

  #projectActivities(event: ActivityLoggedEvent) {
    const index = this.#activities.findIndex(
      (activity) =>
        activity.client === event.client &&
        activity.project === event.project &&
        activity.task === event.task &&
        activity.category == event.category,
    );
    if (index == -1) {
      this.#activities.push({
        start: event.timestamp,
        finish: event.timestamp,
        client: event.client,
        project: event.project,
        task: event.task,
        category: event.category,
        hours: event.duration,
      });
    } else {
      const activity = this.#activities[index]!;
      const start =
        Temporal.Instant.compare(event.timestamp, activity.start) < 0
          ? event.timestamp
          : activity.start;
      const finish =
        Temporal.Instant.compare(event.timestamp, activity.finish) > 0
          ? event.timestamp
          : activity.finish;
      this.#activities[index] = {
        ...activity,
        start,
        finish,
        hours: normalizeDuration(activity.hours.add(event.duration)),
      };
    }
  }

  #projectCategories(event: ActivityLoggedEvent) {
    if (event.category != null && !this.#categories.includes(event.category)) {
      this.#categories.push(event.category);
      this.#categories.sort();
    }
  }
}

type Activity = {
  readonly start: Temporal.Instant;
  readonly finish: Temporal.Instant;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly category?: string;
  readonly hours: Temporal.Duration;
};
