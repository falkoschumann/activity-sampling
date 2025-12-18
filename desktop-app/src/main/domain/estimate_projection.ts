// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  ActivityLoggedEvent,
  EstimateEntry,
  EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/activities";

export async function projectEstimate({
  replay,
  query,
}: {
  replay: AsyncGenerator<ActivityLoggedEvent>;
  query: EstimateQuery;
}): Promise<EstimateQueryResult> {
  const activitiesProjection = new ActivitiesProjection(query.categories);
  const categoriesProjection = new CategoriesProjection();
  for await (const event of replay) {
    activitiesProjection.update(event);
    categoriesProjection.update(event);
  }
  const activities = activitiesProjection.get();
  const cycleTimes = determineCycleTimes(activities);
  return EstimateQueryResult.create({
    cycleTimes,
    categories: categoriesProjection.get(),
    totalCount: activities.length,
  });
}

// TODO extract helper function

export class Activity {
  static create({
    start,
    finish,
    client,
    project,
    task,
  }: {
    start: Temporal.PlainDateLike | string;
    finish: Temporal.PlainDateLike | string;
    client: string;
    project: string;
    task: string;
  }): Activity {
    return new Activity(start, finish, client, project, task);
  }

  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;

  private constructor(
    start: Temporal.PlainDateLike | string,
    finish: Temporal.PlainDateLike | string,
    client: string,
    project: string,
    task: string,
  ) {
    this.start = Temporal.PlainDate.from(start);
    this.finish = Temporal.PlainDate.from(finish);
    this.client = client;
    this.project = project;
    this.task = task;
  }
}

class ActivitiesProjection {
  readonly #categories: string[];
  #activities: Activity[] = [];

  constructor(categories: string[] = []) {
    this.#categories = categories;
  }

  update(event: ActivityLoggedEvent) {
    if (
      this.#categories &&
      this.#categories.length > 0 &&
      !this.#categories.includes(event.category ?? "")
    ) {
      // filter by selected categories
      return;
    }

    const date = event.dateTime.toPlainDate();
    const index = this.#activities.findIndex(
      (activity) =>
        activity.client === event.client &&
        activity.project === event.project &&
        activity.task === event.task,
    );
    if (index === -1) {
      const activity = Activity.create({
        start: date,
        finish: date,
        client: event.client,
        project: event.project,
        task: event.task,
      });
      this.#activities.push(activity);
    } else {
      const activity = this.#activities[index];
      let start = activity.start;
      let finish = activity.finish;
      if (Temporal.PlainDate.compare(date, start) < 0) {
        start = date;
      }
      if (Temporal.PlainDate.compare(date, finish) > 0) {
        finish = date;
      }
      this.#activities[index] = Activity.create({
        ...activity,
        start,
        finish,
      });
    }
  }

  get() {
    return this.#activities;
  }
}

class CategoriesProjection {
  #categories: string[] = [];

  update(event: ActivityLoggedEvent) {
    if (this.#categories.includes(event.category ?? "")) {
      return;
    }

    this.#categories.push(event.category ?? "");
  }

  get() {
    return this.#categories.sort();
  }
}

function determineCycleTimes(activities: Activity[]) {
  const cycleTimeCounts = new Map<number, number>();
  for (const activity of activities) {
    const cycleTimeDays =
      activity.finish.since(activity.start).total("days") + 1;
    const frequency = cycleTimeCounts.get(cycleTimeDays) ?? 0;
    cycleTimeCounts.set(cycleTimeDays, frequency + 1);
  }

  const sortedCycleTimes = Array.from(cycleTimeCounts.entries()).sort(
    (a, b) => a[0] - b[0],
  );
  const totalFrequencies = Array.from(cycleTimeCounts.values()).reduce(
    (sum, freq) => sum + freq,
    0,
  );
  let cumulativeProbability = 0;
  return sortedCycleTimes.map(([cycleTime, frequency]) => {
    const probability = frequency / totalFrequencies;
    cumulativeProbability += probability;
    return EstimateEntry.create({
      cycleTime,
      frequency,
      probability,
      cumulativeProbability,
    });
  });
}
