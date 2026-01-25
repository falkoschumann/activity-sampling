// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type { Clock } from "../../shared/common/temporal";
import type {
  StatisticsQuery,
  StatisticsQueryResult,
} from "../../shared/domain/statistics_query";
import { projectStatistics } from "../domain/statistics_projection";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import type { EventStore } from "../infrastructure/event_store";

export async function queryStatistics(
  query: StatisticsQuery,
  eventStore: EventStore,
  clock: Clock,
): Promise<StatisticsQueryResult> {
  // TODO handle time zone in projection
  // TODO join ActivityLoggedEvent and ActivityLoggedEventDto to ActivityLoggedEvent
  const timeZone = query.timeZone || clock.zone;
  const replay = replayTyped(eventStore.replay(), timeZone);
  return projectStatistics(replay, {
    ...query,
    timeZone: query.timeZone ?? clock.zone,
  });
}

async function* replayTyped(
  events: AsyncGenerator,
  timeZone: Temporal.TimeZoneLike,
) {
  for await (const e of events) {
    yield ActivityLoggedEventDto.fromJson(e).validate(timeZone);
  }
}
