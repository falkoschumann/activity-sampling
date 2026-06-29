// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type GetCurrentIntervalQuery,
  GetCurrentIntervalQueryResult,
} from "../../shared/domain/get_current_interval.query";
import { getCurrentInterval } from "../domain/get_current_interval.query";
import { State } from "@muspellheim/shared";
import { createTimer, type TimerView } from "../domain/timer.read_model";

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
    let view = this.#view.get();
    view = getCurrentInterval(view, query);
    this.#view.put(view);
    return GetCurrentIntervalQueryResult.create(view);
  }
}
