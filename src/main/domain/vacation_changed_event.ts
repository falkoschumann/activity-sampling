// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Vacation } from "./calendar";

export class VacationChangedEvent {
  static create({ vacations }: { vacations: Vacation[] }) {
    return new VacationChangedEvent(vacations);
  }

  readonly vacations: Vacation[];

  private constructor(vacations: Vacation[]) {
    this.vacations = vacations;
  }
}
