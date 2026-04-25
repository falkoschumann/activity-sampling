// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import { normalizeDuration } from "../../shared/domain/temporal";
import type { ActivityLoggedEvent } from "./activity_logged_event";

export class TotalHoursProjection {
  static create() {
    return new TotalHoursProjection();
  }

  #totalHours = Temporal.Duration.from("PT0S");

  private constructor() {}

  update(event: ActivityLoggedEvent) {
    this.#totalHours = this.#totalHours.add(event.duration);
  }

  get() {
    return normalizeDuration(this.#totalHours);
  }
}
