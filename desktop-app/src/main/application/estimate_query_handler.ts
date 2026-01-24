// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type { Clock } from "../../shared/common/temporal";
import type {
  EstimateQuery,
  EstimateQueryResult,
} from "../../shared/domain/estimate_query";
import { projectEstimate } from "../domain/estimate_projection";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import type { EventStore } from "../infrastructure/event_store";

export async function queryEstimate(
  query: EstimateQuery,
  eventStore: EventStore,
  clock: Clock,
): Promise<EstimateQueryResult> {
  // TODO handle time zone in projection
  // TODO join ActivityLoggedEvent and ActivityLoggedEventDto to ActivityLoggedEvent
  const timeZone = query.timeZone || clock.zone;
  const replay = replayTyped(eventStore.replay(), timeZone);
  return projectEstimate(replay, query);
}

async function* replayTyped(
  events: AsyncGenerator,
  timeZone: Temporal.TimeZoneLike,
) {
  for await (const e of events) {
    yield ActivityLoggedEventDto.fromJson(e).validate(timeZone);
  }
}
