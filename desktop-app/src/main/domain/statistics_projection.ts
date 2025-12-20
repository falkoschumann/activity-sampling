// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import {
  ActivityLoggedEvent,
  StatisticsQuery,
  StatisticsQueryResult,
  StatisticsScope,
  type StatisticsScopeType,
} from "../../shared/domain/activities";
import { normalizeDuration } from "../../shared/common/temporal";

export async function projectStatistics(
  replay: AsyncGenerator<ActivityLoggedEvent>,
  query: StatisticsQuery,
): Promise<StatisticsQueryResult> {
  const activitiesProjection = new ActivitiesProjection(query.categories);
  const categoriesProjection = new CategoriesProjection();
  for await (const event of replay) {
    activitiesProjection.update(event);
    categoriesProjection.update(event);
  }
  const activities = activitiesProjection.get();

  let result;
  switch (query.scope) {
    case StatisticsScope.WORKING_HOURS:
      result = await createWorkingHoursStatistics(activities);
      break;
    case StatisticsScope.CYCLE_TIMES:
      result = await createCycleTimesStatistics(activities);
      break;
  }

  const histogram = createHistogram(
    result.xAxisLabel,
    result.days,
    query.scope,
  );
  const median = createMedian(result.days);

  return {
    histogram,
    median,
    categories: categoriesProjection.get(),
    totalCount: result.totalCount,
  };
}

// TODO extract helper function

export class Activity {
  static create({
    start,
    finish,
    client,
    project,
    task,
    hours,
  }: {
    start: Temporal.PlainDateLike | string;
    finish: Temporal.PlainDateLike | string;
    client: string;
    project: string;
    task: string;
    hours: Temporal.DurationLike | string;
  }): Activity {
    return new Activity(start, finish, client, project, task, hours);
  }

  readonly start: Temporal.PlainDate;
  readonly finish: Temporal.PlainDate;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly hours: Temporal.Duration;

  private constructor(
    start: Temporal.PlainDateLike | string,
    finish: Temporal.PlainDateLike | string,
    client: string,
    project: string,
    task: string,
    hours: Temporal.DurationLike | string,
  ) {
    this.start = Temporal.PlainDate.from(start);
    this.finish = Temporal.PlainDate.from(finish);
    this.client = client;
    this.project = project;
    this.task = task;
    this.hours = Temporal.Duration.from(hours);
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
        hours: event.duration,
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
      const hours = activity.hours.add(event.duration);
      this.#activities[index] = Activity.create({
        ...activity,
        start,
        finish,
        hours: normalizeDuration(hours),
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

async function createWorkingHoursStatistics(activities: Activity[]) {
  let totalCount = 0;
  let days: number[] = [];
  for await (const activity of activities) {
    totalCount++;
    const workDays = activity.hours.total("hours") / 8;
    days.push(workDays);
  }
  days = Object.values(days).sort((a, b) => a - b);
  return { xAxisLabel: "Duration (days)", days, totalCount };
}

async function createCycleTimesStatistics(activities: Activity[]) {
  let totalCount = 0;
  let days: number[] = [];
  for (const activity of activities) {
    totalCount++;
    const cycleTime = activity.finish.since(activity.start).total("days") + 1;
    days.push(cycleTime);
  }
  days = Object.values(days).sort((a, b) => a - b);
  return { xAxisLabel: "Cycle time (days)", days, totalCount };
}

function createHistogram(
  xAxisLabel: string,
  days: number[],
  scope: StatisticsScopeType,
) {
  const maxDay = days.at(-1) ?? 0;
  const binEdges: number[] = [];
  const frequencies: number[] = [];
  let i = 0;
  while (i < Math.ceil(maxDay)) {
    if (i === 0) {
      binEdges.push(0);
      frequencies.push(0);
      if (scope === StatisticsScope.WORKING_HOURS) {
        binEdges.push(0.5);
        frequencies.push(0);
      }
      binEdges.push(1);
      frequencies.push(0);
      binEdges.push(2);
      i = 2;
    } else {
      i = binEdges.at(-2)! + binEdges.at(-1)!;
      frequencies.push(0);
      binEdges.push(i);
    }
  }

  for (const day of days) {
    for (let i = 0; i < binEdges.length - 1; i++) {
      if (binEdges[i] < day && day <= binEdges[i + 1]) {
        frequencies[i]++;
        break;
      }
    }
  }

  return {
    binEdges: binEdges.map((edge) => String(edge)),
    frequencies,
    xAxisLabel,
    yAxisLabel: "Number of Tasks",
  };
}

function createMedian(days: number[]) {
  const maxDay = days.at(-1) ?? 0;
  const edge0 = 0;
  let edge25 = 0;
  let edge50 = 0;
  let edge75 = 0;
  let edge100 = 0;
  if (days.length > 0) {
    const i25 = Math.max(0, days.length * 0.25 - 1);
    if (Number.isInteger(i25)) {
      edge25 = days[i25];
    } else {
      edge25 = (days[Math.floor(i25)] + days[Math.ceil(i25)]) / 2;
    }
    edge25 = Math.round(edge25 * 10) / 10;

    if (days.length % 2 === 0) {
      edge50 = (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
    } else {
      edge50 = days[Math.floor(days.length / 2)];
    }
    edge50 = Math.round(edge50 * 10) / 10;

    const i75 = days.length * 0.75 - 1;
    if (Number.isInteger(i75)) {
      edge75 = days[i75];
    } else {
      edge75 = (days[Math.floor(i75)] + days[Math.ceil(i75)]) / 2;
    }
    edge75 = Math.round(edge75 * 10) / 10;

    edge100 = maxDay;
  }

  return { edge0, edge25, edge50, edge75, edge100 };
}
