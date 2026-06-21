// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { VacationState } from "./vacation.aggregate";

export class VacationsChangedEvent {
  static create({ vacations }: { vacations: VacationState[] }) {
    return new VacationsChangedEvent(vacations);
  }

  readonly vacations: VacationState[];

  private constructor(vacations: VacationState[]) {
    this.vacations = vacations;
  }
}
