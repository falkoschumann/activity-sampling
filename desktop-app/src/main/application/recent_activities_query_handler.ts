// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal } from "@js-temporal/polyfill";

import type { Clock } from "../../shared/common/temporal";
import type {
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../../shared/domain/recent_activities_query";
import { projectRecentActivities } from "../domain/recent_activities_projection";
import { ActivityLoggedEventDto } from "../infrastructure/events";
import type { EventStore } from "../infrastructure/event_store";

export async function queryRecentActivities(
  query: RecentActivitiesQuery,
  eventStore: EventStore,
  clock: Clock,
): Promise<RecentActivitiesQueryResult> {
  // TODO handle time zone in projection
  // TODO join ActivityLoggedEvent and ActivityLoggedEventDto to ActivityLoggedEvent
  const timeZone = query.timeZone || clock.zone;
  const replay = replayTyped(eventStore.replay(), timeZone);
  return projectRecentActivities(replay, {
    ...query,
    today:
      query.today ??
      clock.instant().toZonedDateTimeISO(clock.zone).toPlainDate(),
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
