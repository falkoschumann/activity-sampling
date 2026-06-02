// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { ActivityLoggedEvent } from "./activity_logged_event";
import { type Holiday, Vacation } from "./calendar";
import { CapacityChangedEvent } from "./capacity_changed_event";
import { HolidaysChangedEvent } from "./holidays_changed_event";
import { VacationChangedEvent } from "./vacation_changed_event";
import { CategoriesChangedEvent } from "./categories_changed_event";

export type TimesheetReadModel = {
  entries: TimesheetReadModelEntry[];
  holidays: Holiday[];
  vacations: Vacation[];
  capacity: Temporal.Duration;
  categories: string[];
};

export type TimesheetReadModelEntry = {
  readonly timestamp: Temporal.Instant;
  readonly duration: Temporal.Duration;
  readonly client: string;
  readonly project: string;
  readonly task: string;
  readonly notes?: string;
  readonly category?: string;
};

export const initialTimesheetReadModel: TimesheetReadModel = {
  entries: [],
  holidays: [],
  vacations: [],
  capacity: Temporal.Duration.from("PT40H"),
  categories: [],
};

export function projectTimesheet(
  readModel: TimesheetReadModel = initialTimesheetReadModel,
  event:
    | ActivityLoggedEvent
    | CapacityChangedEvent
    | HolidaysChangedEvent
    | VacationChangedEvent
    | CategoriesChangedEvent,
): TimesheetReadModel {
  if (event instanceof ActivityLoggedEvent) {
    const entries = [...readModel.entries, event];
    entries.sort((a, b) => Temporal.Instant.compare(a.timestamp, b.timestamp));
    return { ...readModel, entries };
  } else if (event instanceof HolidaysChangedEvent) {
    return { ...readModel, holidays: event.holidays };
  } else if (event instanceof VacationChangedEvent) {
    return { ...readModel, vacations: event.vacations };
  } else if (event instanceof CapacityChangedEvent) {
    return { ...readModel, capacity: event.capacity };
  } else if (event instanceof CategoriesChangedEvent) {
    return { ...readModel, categories: event.categories };
  } else {
    return readModel;
  }
}
