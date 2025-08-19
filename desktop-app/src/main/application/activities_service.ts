// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type CommandStatus, createSuccess } from "../common/messages";

import { Clock, normalizeDuration } from "../common/temporal";
import {
  type Activity,
  createActivity,
  type LogActivityCommand,
  type RecentActivitiesQuery,
  type RecentActivitiesQueryResult,
  type ReportEntry,
  type ReportQuery,
  type ReportQueryResult,
  Scope,
  type TimesheetEntry,
  type TimesheetQuery,
  type TimesheetQueryResult,
  type WorkingDay,
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

  readonly #eventStore: EventStore;
  readonly #clock: Clock;

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

  async queryReport(query: ReportQuery): Promise<ReportQueryResult> {
    const projection = new ReportProjection(query, this.#clock);
    const replay = this.#eventStore.replay();
    return projection.project(replay);
  }

  queryTimesheet(query: TimesheetQuery): Promise<TimesheetQueryResult> {
    const projection = new TimesheetProjection(query, this.#clock);
    const replay = this.#eventStore.replay();
    return projection.project(replay);
  }
}

class RecentActivitiesProjection {
  readonly #timeZone: Temporal.TimeZoneLike;
  readonly #today: Temporal.PlainDate;
  readonly #yesterday: Temporal.PlainDate;
  readonly #thisWeekStart: Temporal.PlainDate;
  readonly #thisWeekEnd: Temporal.PlainDate;
  readonly #thisMonthStart: Temporal.PlainDate;
  readonly #nextMonthStart: Temporal.PlainDate;

  #lastActivity?: Activity;

  // working days
  #workingDays: WorkingDay[] = [];
  #date?: Temporal.PlainDate;
  #activities: Activity[] = [];

  // time summary
  #hoursToday = Temporal.Duration.from("PT0S");
  #hoursYesterday = Temporal.Duration.from("PT0S");
  #hoursThisWeek = Temporal.Duration.from("PT0S");
  #hoursThisMonth = Temporal.Duration.from("PT0S");

  constructor(query: RecentActivitiesQuery, clock: Clock) {
    this.#timeZone = query.timeZone ?? clock.zone;
    this.#today = clock
      .instant()
      .toZonedDateTimeISO(this.#timeZone)
      .toPlainDate();
    this.#yesterday = this.#today.subtract({ days: 1 });
    this.#thisWeekStart = this.#today.subtract({
      days: this.#today.dayOfWeek - 1,
    });
    this.#thisWeekEnd = this.#thisWeekStart.add("P6D");
    this.#thisMonthStart = this.#today.with({ day: 1 });
    this.#nextMonthStart = this.#thisMonthStart.add("P1M");
  }

  async project(events: AsyncGenerator): Promise<RecentActivitiesQueryResult> {
    const from = this.#today
      .subtract({ days: 30 })
      .toZonedDateTime({ plainTime: "00:00", timeZone: this.#timeZone })
      .toInstant();
    for await (const e of events) {
      // TODO handle type error
      const event = ActivityLoggedEvent.from(e);
      const timestamp = Temporal.Instant.from(event.timestamp);
      if (Temporal.Instant.compare(timestamp, from) < 0) {
        continue;
      }

      const activity = createActivityFromActivityLoggedEvent(
        event,
        this.#timeZone,
      );
      this.#updateLastActivity(activity);
      this.#updateWorkingDays(activity);
      this.#updateTimeSummary(activity);
    }
    this.#createWorkingDay();

    this.#workingDays = this.#workingDays.sort((d1, d2) =>
      Temporal.PlainDate.compare(
        Temporal.PlainDate.from(d2.date),
        Temporal.PlainDate.from(d1.date),
      ),
    );
    return {
      lastActivity: this.#lastActivity,
      workingDays: this.#workingDays,
      timeSummary: {
        hoursToday: normalizeDuration(this.#hoursToday).toString(),
        hoursYesterday: normalizeDuration(this.#hoursYesterday).toString(),
        hoursThisWeek: normalizeDuration(this.#hoursThisWeek).toString(),
        hoursThisMonth: normalizeDuration(this.#hoursThisMonth).toString(),
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

  #updateWorkingDays(activity: Activity) {
    const activityDate = Temporal.PlainDate.from(activity.dateTime);
    if (this.#date == null || !activityDate.equals(this.#date)) {
      this.#createWorkingDay();
      this.#date = activityDate;
      this.#activities = [];
    }
    this.#activities.push(activity);
  }

  #createWorkingDay() {
    if (this.#date == null) {
      return;
    }

    this.#activities = this.#activities.sort((a1, a2) =>
      Temporal.PlainDateTime.compare(
        Temporal.PlainDateTime.from(a2.dateTime),
        Temporal.PlainDateTime.from(a1.dateTime),
      ),
    );
    const day = { date: this.#date.toString(), activities: this.#activities };
    this.#workingDays.push(day);
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
    dateTime: Temporal.Instant.from(event.timestamp)
      .toZonedDateTimeISO(timeZone)
      .toPlainDateTime()
      .toString({ smallestUnit: "minutes" }),
  });
}

class ReportProjection {
  readonly #startInclusive: Temporal.PlainDate;
  readonly #endExclusive: Temporal.PlainDate;
  readonly #scope: Scope;
  readonly #timeZone: Temporal.TimeZoneLike;

  #entries: ReportEntry[] = [];
  #totalHours = Temporal.Duration.from("PT0S");

  constructor(query: ReportQuery, clock: Clock) {
    this.#startInclusive = Temporal.PlainDate.from(query.from);
    this.#endExclusive = Temporal.PlainDate.from(query.to);
    this.#scope = query.scope;
    this.#timeZone = query.timeZone ?? clock.zone;
  }

  async project(events: AsyncGenerator): Promise<ReportQueryResult> {
    for await (const e of events) {
      // TODO handle type error
      const event = ActivityLoggedEvent.from(e);
      const date = Temporal.Instant.from(event.timestamp)
        .toZonedDateTimeISO(this.#timeZone)
        .toPlainDate();
      if (
        Temporal.PlainDate.compare(date, this.#startInclusive) < 0 ||
        Temporal.PlainDate.compare(date, this.#endExclusive) >= 0
      ) {
        continue;
      }

      const activity = createActivityFromActivityLoggedEvent(
        event,
        this.#timeZone,
      );
      this.#updateEntries(activity);
      this.#updateTotalHours(activity);
    }

    this.#entries = this.#entries.sort((e1, e2) =>
      e1.name.localeCompare(e2.name),
    );
    return { entries: this.#entries, totalHours: this.#totalHours.toString() };
  }

  #updateEntries(activity: Activity) {
    switch (this.#scope) {
      case Scope.CLIENTS:
        this.#updateEntry(activity.client, activity.duration);
        break;
      case Scope.PROJECTS:
        this.#updateProjects(
          activity.project,
          activity.client,
          activity.duration,
        );
        break;
      case Scope.TASKS:
        this.#updateEntry(activity.task, activity.duration);
        break;
      default:
        throw new Error(`Unknown scope: ${this.#scope}`);
    }
  }

  #updateEntry(name: string, duration: string) {
    const index = this.#entries.findIndex((entry) => entry.name === name);
    if (index == -1) {
      this.#entries.push({ name, hours: duration });
    } else {
      const existingEntry = this.#entries[index];
      const accumulatedHours = Temporal.Duration.from(existingEntry.hours).add(
        Temporal.Duration.from(duration),
      );
      this.#entries[index] = {
        ...existingEntry,
        hours: accumulatedHours.toString(),
      };
    }
  }

  #updateProjects(project: string, client: string, duration: string) {
    const index = this.#entries.findIndex((entry) => entry.name === project);
    if (index == -1) {
      this.#entries.push({ name: project, client, hours: duration });
    } else {
      const existingEntry = this.#entries[index];
      let existingClient = existingEntry.client;
      if (!existingClient!.includes(client)) {
        existingClient = existingClient
          ? `${existingClient}, ${client}`
          : client;
      }
      const accumulatedHours = Temporal.Duration.from(existingEntry.hours).add(
        Temporal.Duration.from(duration),
      );
      this.#entries[index] = {
        ...existingEntry,
        client: existingClient,
        hours: accumulatedHours.toString(),
      };
    }
  }

  #updateTotalHours(activity: Activity) {
    const duration = Temporal.Duration.from(activity.duration);
    this.#totalHours = this.#totalHours.add(duration);
  }
}

class TimesheetProjection {
  readonly #startInclusive: Temporal.PlainDate;
  readonly #endExclusive: Temporal.PlainDate;
  readonly #timeZone: Temporal.TimeZoneLike;
  // TODO read default capacity from configuration
  readonly #defaultCapacity = Temporal.Duration.from("PT40H");

  #entries: TimesheetEntry[] = [];
  #totalHours = Temporal.Duration.from("PT0S");

  constructor(query: TimesheetQuery, clock: Clock) {
    this.#startInclusive = Temporal.PlainDate.from(query.from);
    this.#endExclusive = Temporal.PlainDate.from(query.to).add("P1D");
    this.#timeZone = query.timeZone ?? clock.zone;
  }

  async project(events: AsyncGenerator): Promise<TimesheetQueryResult> {
    for await (const e of events) {
      // TODO handle type error
      const event = ActivityLoggedEvent.from(e);
      const date = Temporal.Instant.from(event.timestamp)
        .toZonedDateTimeISO(this.#timeZone)
        .toPlainDate();
      if (
        Temporal.PlainDate.compare(date, this.#startInclusive) < 0 ||
        Temporal.PlainDate.compare(date, this.#endExclusive) >= 0
      ) {
        continue;
      }

      const activity = createActivityFromActivityLoggedEvent(
        event,
        this.#timeZone,
      );
      this.#updateEntries(activity);
      this.#updateTotalHours(activity);
    }

    const capacity = this.#determineCapacity();
    this.#entries = this.#entries.sort((entry1, entry2) => {
      const dateComparison = Temporal.PlainDate.compare(
        Temporal.PlainDate.from(entry1.date),
        Temporal.PlainDate.from(entry2.date),
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

    return {
      entries: this.#entries,
      workingHoursSummary: {
        totalHours: normalizeDuration(this.#totalHours).toString(),
        capacity: capacity.toString(),
        offset: "PT0S",
      },
    };
  }

  #updateEntries(activity: Activity) {
    const date = Temporal.PlainDate.from(activity.dateTime);
    const index = this.#entries.findIndex(
      (entry) =>
        entry.date === date.toString() &&
        entry.client === activity.client &&
        entry.project === activity.project &&
        entry.task === activity.task,
    );
    if (index === -1) {
      const newEntry: TimesheetEntry = {
        date: date.toString(),
        client: activity.client,
        project: activity.project,
        task: activity.task,
        hours: activity.duration,
      };
      this.#entries.push(newEntry);
    } else {
      const existingEntry = this.#entries[index];
      const accumulatedHours = Temporal.Duration.from(existingEntry.hours).add(
        Temporal.Duration.from(activity.duration),
      );
      this.#entries[index] = {
        ...existingEntry,
        hours: normalizeDuration(accumulatedHours).toString(),
      };
    }
  }

  #updateTotalHours(activity: Activity) {
    const duration = Temporal.Duration.from(activity.duration);
    this.#totalHours = this.#totalHours.add(duration);
  }

  #determineCapacity(): Temporal.Duration {
    const businessDays = 5;
    const defaultCapacityPerDay = this.#defaultCapacity.hours / 5;
    const capacity = Temporal.Duration.from({
      hours: businessDays * defaultCapacityPerDay,
    });
    return normalizeDuration(capacity);
  }
}
