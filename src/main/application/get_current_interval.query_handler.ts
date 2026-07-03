// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { State } from "@muspellheim/shared";

import {
  createTimer,
  type TimerView,
} from "../../shared/domain/timer.read_model";
import {
  getCurrentInterval,
  type GetCurrentIntervalQuery,
  type GetCurrentIntervalQueryResult,
} from "../../shared/domain/get_current_interval.query";

export class GetCurrentIntervalQueryHandler {
  static create({ view }: { view: State<TimerView> }) {
    return new GetCurrentIntervalQueryHandler(view);
  }

  static createNull({ state = createTimer() }: { state?: TimerView } = {}) {
    return new GetCurrentIntervalQueryHandler(new State(state));
  }

  readonly #view;

  private constructor(view: State<TimerView>) {
    this.#view = view;
  }

  async handle(
    query: GetCurrentIntervalQuery,
  ): Promise<GetCurrentIntervalQueryResult> {
    const view = this.#view.get();
    return getCurrentInterval(view, query);
  }
}
