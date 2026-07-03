// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { VacationState } from "./vacation.aggregate";

export interface VacationsChangedEvent {
  readonly type: "vacations-changed";
  readonly data: VacationsChangedEventData;
}

export type VacationsChangedEventData = Readonly<{
  vacations: VacationState[];
}>;

export function createVacationsChangedEvent({
  vacations,
}: {
  vacations: VacationState[];
}): VacationsChangedEvent {
  return {
    type: "vacations-changed",
    data: { vacations },
  };
}
