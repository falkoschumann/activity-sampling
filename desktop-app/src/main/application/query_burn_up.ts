// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { Clock } from "../../shared/common/temporal";
import {
  type BurnUpQuery,
  BurnUpQueryResult,
} from "../../shared/domain/burn_up_query";
import { projectBurnUp } from "../domain/burn_up_projection";
import type { EventStore } from "../infrastructure/event_store";
import { Temporal } from "@js-temporal/polyfill";
import { ActivityLoggedEventDto } from "../infrastructure/events";

export async function queryBurnUp(
  query: BurnUpQuery,
  eventStore: EventStore,
  clock: Clock,
): Promise<BurnUpQueryResult> {
  const timeZone = query.timeZone || clock.zone;
  const replay = replayTyped(eventStore.replay(), timeZone);
  return projectBurnUp(replay, query);
}

async function* replayTyped(
  events: AsyncGenerator,
  timeZone: Temporal.TimeZoneLike,
) {
  for await (const e of events) {
    yield ActivityLoggedEventDto.fromJson(e).validate(timeZone);
  }
}
