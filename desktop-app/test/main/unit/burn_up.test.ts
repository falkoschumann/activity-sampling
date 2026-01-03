// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Clock } from "../../../src/shared/common/temporal";
import { ActivityLoggedEventDto } from "../../../src/main/infrastructure/events";
import { BurnUpQueryHandler } from "../../../src/main/application/burn_up_query_handler";
import {
  BurnUpData,
  BurnUpQuery,
  BurnUpQueryResult,
} from "../../../src/shared/domain/burn_up_query";
import { EventStore } from "../../../src/main/infrastructure/event_store";

describe("Burn-up", () => {
  describe("Display tasks done over time", () => {
    it("should return an empty result when no event is recorded", async () => {
      const { handler } = configure({ events: [] });

      const result = await handler.queryBurnUp(
        BurnUpQuery.create({
          from: "2021-10-11",
          to: "2021-10-22",
        }),
      );

      expect(result).toEqual(BurnUpQueryResult.create());
    });

    it("should return data for a given period", async () => {
      const events = [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-12T16:00:00Z",
          task: "task-1",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-13T16:00:00Z",
          task: "task-2",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-14T16:00:00Z",
          task: "task-3",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-15T16:00:00Z",
          task: "task-4",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-18T12:00:00Z",
          task: "task-5",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-18T16:00:00Z",
          task: "task-6",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-19T12:00:00Z",
          task: "task-7",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-19T16:00:00Z",
          task: "task-8",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-20T16:00:00Z",
          task: "task-9",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-21T16:00:00Z",
          task: "task-10",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-22T12:00:00Z",
          task: "task-11",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2021-10-22T16:00:00Z",
          task: "task-12",
        }),
      ];
      const { handler } = configure({ events });

      const result = await handler.queryBurnUp(
        BurnUpQuery.create({
          from: "2021-10-11",
          to: "2021-10-22",
        }),
      );

      expect(result).toEqual(
        BurnUpQueryResult.create({
          data: [
            BurnUpData.create({
              date: "2021-10-11",
              throughput: 0,
              cumulativeThroughput: 0,
            }),
            BurnUpData.create({
              date: "2021-10-12",
              throughput: 1,
              cumulativeThroughput: 1,
            }),
            BurnUpData.create({
              date: "2021-10-13",
              throughput: 1,
              cumulativeThroughput: 2,
            }),
            BurnUpData.create({
              date: "2021-10-14",
              throughput: 1,
              cumulativeThroughput: 3,
            }),
            BurnUpData.create({
              date: "2021-10-15",
              throughput: 1,
              cumulativeThroughput: 4,
            }),
            BurnUpData.create({
              date: "2021-10-16",
              throughput: 0,
              cumulativeThroughput: 4,
            }),
            BurnUpData.create({
              date: "2021-10-17",
              throughput: 0,
              cumulativeThroughput: 4,
            }),
            BurnUpData.create({
              date: "2021-10-18",
              throughput: 2,
              cumulativeThroughput: 6,
            }),
            BurnUpData.create({
              date: "2021-10-19",
              throughput: 2,
              cumulativeThroughput: 8,
            }),
            BurnUpData.create({
              date: "2021-10-20",
              throughput: 1,
              cumulativeThroughput: 9,
            }),
            BurnUpData.create({
              date: "2021-10-21",
              throughput: 1,
              cumulativeThroughput: 10,
            }),
            BurnUpData.create({
              date: "2021-10-22",
              throughput: 2,
              cumulativeThroughput: 12,
            }),
          ],
          totalThroughput: 12,
        }),
      );
    });
  });
});

function configure({ events }: { events: unknown[] }) {
  const eventStore = EventStore.createNull({ events });
  const handler = new BurnUpQueryHandler(eventStore, Clock.systemDefaultZone());
  return { handler };
}
