// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";
import { type CommandStatus, Success } from "@muspellheim/shared";

import { Clock, normalizeDuration } from "../../shared/common/temporal";
import {
  Activity,
  type LogActivityCommand,
  type RecentActivitiesQuery,
  type RecentActivitiesQueryResult,
  ReportEntry,
  type ReportQuery,
  type ReportQueryResult,
  Scope,
  type TimesheetEntry,
  type TimesheetQuery,
  type TimesheetQueryResult,
  type WorkingDay,
} from "../../shared/domain/activities";
import { Calendar, type Holiday } from "../domain/calendar";
import { EventStore } from "../infrastructure/event_store";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import { HolidayRepository } from "../infrastructure/holiday_repository";

export interface ActivitiesConfiguration {
  readonly capacity: Temporal.Duration;
}

export class ActivitiesService {
  static create({
    configuration = { capacity: Temporal.Duration.from("PT40H") },
    eventStore = EventStore.create(),
    holidayRepository = HolidayRepository.create(),
    clock = Clock.systemDefaultZone(),
  }: {
    configuration?: ActivitiesConfiguration;
    eventStore?: EventStore;
    holidayRepository?: HolidayRepository;
    clock?: Clock;
  } = {}): ActivitiesService {
    return new ActivitiesService(
      configuration,
      eventStore,
      holidayRepository,
      clock,
    );
  }

  static createNull({
    configuration = { capacity: Temporal.Duration.from("PT40H") },
    eventStore = EventStore.createNull(),
    holidayRepository = HolidayRepository.createNull({ holidays: [[]] }),
    fixedInstant = "1970-01-01T00:00:00Z",
    zone = "Europe/Berlin",
  }: {
    configuration?: ActivitiesConfiguration;
    eventStore?: EventStore;
    holidayRepository?: HolidayRepository;
    fixedInstant?: Temporal.Instant | string;
    zone?: Temporal.TimeZoneLike;
  } = {}): ActivitiesService {
    return new ActivitiesService(
      configuration,
      eventStore,
      holidayRepository,
      Clock.fixed(fixedInstant, zone),
    );
  }

  readonly #configuration: ActivitiesConfiguration;
  readonly #eventStore: EventStore;
  readonly #holidayRepository: HolidayRepository;
  readonly #clock: Clock;

  constructor(
    configuration: ActivitiesConfiguration,
    eventStore: EventStore,
    holidayRepository: HolidayRepository,
    clock: Clock,
  ) {
    this.#configuration = configuration;
    this.#eventStore = eventStore;
    this.#holidayRepository = holidayRepository;
    this.#clock = clock;
  }

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    const event = ActivityLoggedEventDto.create({
      ...command,
      timestamp: command.timestamp.toString({ smallestUnit: "seconds" }),
      duration: command.duration.toString(),
    });
    await this.#eventStore.record(event);
    return new Success();
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

  async queryTimesheet(query: TimesheetQuery): Promise<TimesheetQueryResult> {
    const holidays = await this.#holidayRepository.findAllByDate(
      query.from,
      query.to,
    );
    const projection = new TimesheetProjection(
      query,
      this.#configuration,
      holidays,
      this.#clock,
    );
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
      .toZonedDateTime({ timeZone: this.#timeZone })
      .toPlainDate();
    const to = this.#today.with({ day: this.#today.daysInMonth }).add("P1D");
    const activities = project(events, this.#timeZone, from, to);
    for await (const activity of activities) {
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
        hoursToday: normalizeDuration(this.#hoursToday),
        hoursYesterday: normalizeDuration(this.#hoursYesterday),
        hoursThisWeek: normalizeDuration(this.#hoursThisWeek),
        hoursThisMonth: normalizeDuration(this.#hoursThisMonth),
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
    const day = { date: this.#date, activities: this.#activities };
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
    const activities = project(
      events,
      this.#timeZone,
      this.#startInclusive,
      this.#endExclusive,
    );
    for await (const activity of activities) {
      this.#updateEntries(activity);
      this.#updateTotalHours(activity);
    }

    this.#entries = this.#entries.sort((e1, e2) =>
      e1.name.localeCompare(e2.name),
    );
    return { entries: this.#entries, totalHours: this.#totalHours };
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

  #updateEntry(name: string, duration: Temporal.DurationLike) {
    const index = this.#entries.findIndex((entry) => entry.name === name);
    if (index == -1) {
      this.#entries.push(new ReportEntry(name, duration));
    } else {
      const existingEntry = this.#entries[index];
      const accumulatedHours = Temporal.Duration.from(existingEntry.hours).add(
        Temporal.Duration.from(duration),
      );
      this.#entries[index] = {
        ...existingEntry,
        hours: accumulatedHours,
      };
    }
  }

  #updateProjects(
    project: string,
    client: string,
    duration: Temporal.DurationLike,
  ) {
    const index = this.#entries.findIndex((entry) => entry.name === project);
    if (index == -1) {
      this.#entries.push(new ReportEntry(project, duration, client));
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
        hours: accumulatedHours,
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
  readonly #defaultCapacity: Temporal.Duration;
  readonly #today: Temporal.PlainDate;
  readonly #calendar: Calendar;

  #entries: TimesheetEntry[] = [];
  #totalHours = Temporal.Duration.from("PT0S");

  constructor(
    query: TimesheetQuery,
    configuration: ActivitiesConfiguration,
    holidays: Holiday[],
    clock: Clock,
  ) {
    this.#startInclusive = Temporal.PlainDate.from(query.from);
    this.#endExclusive = Temporal.PlainDate.from(query.to).add("P1D");
    this.#timeZone = query.timeZone ?? clock.zone;
    this.#defaultCapacity = configuration.capacity;
    this.#today = clock
      .instant()
      .toZonedDateTimeISO(this.#timeZone)
      .toPlainDate();
    const holidaysDates = holidays.map((h) => h.date);
    this.#calendar = Calendar.create({ holidays: holidaysDates });
  }

  async project(events: AsyncGenerator): Promise<TimesheetQueryResult> {
    const activities = project(
      events,
      this.#timeZone,
      this.#startInclusive,
      this.#endExclusive,
    );
    for await (const activity of activities) {
      this.#updateEntries(activity);
      this.#updateTotalHours(activity);
    }

    const capacity = this.#determineCapacity();
    const offset = this.#determineOffset();
    this.#entries = this.#entries.sort((entry1, entry2) => {
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

    return {
      entries: this.#entries,
      workingHoursSummary: {
        totalHours: normalizeDuration(this.#totalHours),
        capacity,
        offset,
      },
    };
  }

  #updateEntries(activity: Activity) {
    const date = Temporal.PlainDate.from(activity.dateTime);
    const index = this.#entries.findIndex(
      (entry) =>
        Temporal.PlainDate.compare(entry.date, date.toString()) === 0 &&
        entry.client === activity.client &&
        entry.project === activity.project &&
        entry.task === activity.task,
    );
    if (index === -1) {
      const newEntry: TimesheetEntry = {
        date,
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
        hours: normalizeDuration(accumulatedHours),
      };
    }
  }

  #updateTotalHours(activity: Activity) {
    const duration = Temporal.Duration.from(activity.duration);
    this.#totalHours = this.#totalHours.add(duration);
  }

  #determineCapacity(): Temporal.Duration {
    const businessDays = this.#calendar.countBusinessDays(
      this.#startInclusive,
      this.#endExclusive,
    );
    const defaultCapacityPerDay = this.#defaultCapacity.hours / 5;
    const capacity = Temporal.Duration.from({
      hours: businessDays * defaultCapacityPerDay,
    });
    return normalizeDuration(capacity);
  }

  #determineOffset(): Temporal.Duration {
    let end: Temporal.PlainDate;
    if (Temporal.PlainDate.compare(this.#today, this.#startInclusive) < 0) {
      end = this.#startInclusive;
    } else if (
      Temporal.PlainDate.compare(this.#today, this.#endExclusive) >= 0
    ) {
      end = this.#endExclusive;
    } else {
      end = this.#today.add("P1D");
    }
    const businessDays = this.#calendar.countBusinessDays(
      this.#startInclusive,
      end,
    );
    const offset = this.#totalHours.subtract({ hours: businessDays * 8 });
    return normalizeDuration(offset);
  }
}

async function* project(
  events: AsyncGenerator,
  timeZone: Temporal.TimeZoneLike,
  startInclusive: Temporal.PlainDate | Temporal.PlainDateLike | string,
  endExclusive: Temporal.PlainDate | Temporal.PlainDateLike | string,
): AsyncGenerator<Activity> {
  for await (const e of events) {
    // TODO handle type error
    const event = ActivityLoggedEventDto.fromJson(e).validate();
    const date = event.timestamp.toZonedDateTimeISO(timeZone).toPlainDate();
    if (
      Temporal.PlainDate.compare(date, startInclusive) < 0 ||
      Temporal.PlainDate.compare(date, endExclusive) >= 0
    ) {
      continue;
    }

    const dateTime = event.timestamp
      .toZonedDateTimeISO(timeZone)
      .toPlainDateTime();
    const activity = new Activity(
      dateTime,
      event.duration,
      event.client,
      event.project,
      event.task,
      event.notes,
    );
    yield activity;
  }
}
