// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { Clock } from "../common/clock";
import { type CommandStatus, createSuccess } from "../common/messages";
import {
  type Activity,
  createActivity,
  type LogActivityCommand,
  type RecentActivitiesQuery,
  type RecentActivitiesQueryResult,
} from "../domain/activities";
import { EventStore } from "../infrastructure/event_store";
import { ActivityLoggedEvent } from "../infrastructure/events";

export class ActivitiesService {
  static create({ eventStore = EventStore.create() }): ActivitiesService {
    return new ActivitiesService(eventStore, Clock.systemUtc());
  }

  static createNull({
    eventStore = EventStore.createNull(),
    fixedInstant = "1970-01-01T00:00:00Z",
    zone = "Europe/Berlin",
  }: {
    eventStore?: EventStore;
    fixedInstant?: Temporal.Instant | string;
    zone?: Temporal.TimeZoneLike;
  } = {}): ActivitiesService {
    return new ActivitiesService(eventStore, Clock.fixed(fixedInstant, zone));
  }

  #eventStore: EventStore;
  #clock: Clock;

  constructor(eventStore: EventStore, clock: Clock) {
    this.#eventStore = eventStore;
    this.#clock = clock;
  }

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    const event = ActivityLoggedEvent.create(command);
    await this.#eventStore.record(event);
    return createSuccess();
  }

  async queryRecentActivities(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    const projection = new RecentActivitiesProjection(query, this.#clock);
    const replay = this.#eventStore.replay();
    return projection.project(replay);
  }
}

class RecentActivitiesProjection {
  readonly #timeZone: string;
  readonly #today: Temporal.PlainDate;
  readonly #yesterday: Temporal.PlainDate;
  readonly #thisWeekStart: Temporal.PlainDate;
  readonly #thisWeekEnd: Temporal.PlainDate;
  readonly #thisMonthStart: Temporal.PlainDate;
  readonly #nextMonthStart: Temporal.PlainDate;

  #lastActivity?: Activity;

  #hoursToday = Temporal.Duration.from("PT0S");
  #hoursYesterday = Temporal.Duration.from("PT0S");
  #hoursThisWeek = Temporal.Duration.from("PT0S");
  #hoursThisMonth = Temporal.Duration.from("PT0S");

  constructor(query: RecentActivitiesQuery, clock: Clock) {
    this.#timeZone = query.timeZone ?? Temporal.Now.timeZoneId();
    this.#today = clock
      .instant()
      .toZonedDateTimeISO(this.#timeZone)
      .toPlainDate();
    this.#yesterday = this.#today.subtract({ days: 1 });
    this.#thisWeekStart = this.#today.subtract({
      days: this.#today.dayOfWeek - 1,
    });
    this.#thisWeekEnd = this.#thisWeekStart.add({ days: 6 });
    this.#thisMonthStart = this.#today.with({ day: 1 });
    this.#nextMonthStart = this.#thisMonthStart.add({ months: 1 });
  }
  async project(events: AsyncGenerator): Promise<RecentActivitiesQueryResult> {
    for await (const e of events) {
      // TODO handle type error
      const event = ActivityLoggedEvent.from(e);
      const activity = createActivityFromActivityLoggedEvent(
        event,
        this.#timeZone,
      );
      this.#updateLastActivity(activity);
      this.#updateTimeSummary(activity);
    }
    return {
      lastActivity: this.#lastActivity,
      workingDays: [],
      timeSummary: {
        hoursToday: this.#hoursToday
          .round({ largestUnit: "hours", smallestUnit: "minutes" })
          .toString(),
        hoursYesterday: this.#hoursYesterday
          .round({ largestUnit: "hours", smallestUnit: "minutes" })
          .toString(),
        hoursThisWeek: this.#hoursThisWeek
          .round({ largestUnit: "hours", smallestUnit: "minutes" })
          .toString(),
        hoursThisMonth: this.#hoursThisMonth
          .round({ largestUnit: "hours", smallestUnit: "minutes" })
          .toString(),
      },
    };
  }

  #updateLastActivity(activity: Activity) {
    if (
      !this.#lastActivity ||
      Temporal.PlainDateTime.compare(
        Temporal.PlainDateTime.from(activity.dateTime),
        Temporal.PlainDateTime.from(this.#lastActivity.dateTime),
      ) > 0
    ) {
      this.#lastActivity = activity;
    }
  }

  #updateTimeSummary(activity: Activity) {
    const date = Temporal.PlainDate.from(activity.dateTime);
    const duration = Temporal.Duration.from(activity.duration);
    if (date.equals(this.#today)) {
      this.#hoursToday = this.#hoursToday.add(duration);
    }
    if (date.equals(this.#yesterday)) {
      this.#hoursYesterday = this.#hoursYesterday.add(duration);
    }
    if (
      Temporal.PlainDate.compare(date, this.#thisWeekStart) >= 0 &&
      Temporal.PlainDate.compare(date, this.#thisWeekEnd) <= 0
    ) {
      this.#hoursThisWeek = this.#hoursThisWeek.add(duration);
    }
    if (
      Temporal.PlainDate.compare(date, this.#thisMonthStart) >= 0 &&
      Temporal.PlainDate.compare(date, this.#nextMonthStart) < 0
    ) {
      this.#hoursThisMonth = this.#hoursThisMonth.add(duration);
    }
  }
}

function createActivityFromActivityLoggedEvent(
  event: ActivityLoggedEvent,
  timeZone: Temporal.TimeZoneLike,
) {
  return createActivity({
    ...event,
    dateTime: Temporal.Instant.from(event.timestamp).toString({
      timeZone,
    }),
  });
}
