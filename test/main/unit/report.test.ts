// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";
import {
  ReportEntry,
  ReportQueryResult,
  ReportScope,
} from "../../../src/shared/domain/report_query";
import { Clock } from "../../../src/shared/domain/temporal";
import { ActivityLoggedEventDto } from "../../../src/main/infrastructure/activity_logged_event_dto";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import { ReportQueryHandler } from "../../../src/main/application/report_query_handler";

describe("Report", () => {
  it("should return report", async () => {
    const { handler } = configure({
      events: [
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-25T15:00:00Z",
          client: "Client 2",
          duration: "PT7H",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-26T15:00:00Z",
          client: "Client 1",
          duration: "PT5H",
        }),
        ActivityLoggedEventDto.createTestInstance({
          timestamp: "2025-06-27T15:00:00Z",
          client: "Client 1",
          duration: "PT3H",
        }),
      ],
    });

    const result = await handler.handle({ scope: ReportScope.CLIENTS });

    expect(result).toEqual<ReportQueryResult>(
      ReportQueryResult.create({
        entries: [
          ReportEntry.create({
            start: "2025-06-26",
            finish: "2025-06-27",
            client: "Client 1",
            hours: "PT8H",
            cycleTime: 2,
          }),
          ReportEntry.create({
            start: "2025-06-25",
            finish: "2025-06-25",
            client: "Client 2",
            hours: "PT7H",
            cycleTime: 1,
          }),
        ],
        totalHours: "PT15H",
      }),
    );
  });
});

function configure({
  events,
  fixedInstant,
}: {
  events?: ActivityLoggedEventDto[];
  fixedInstant?: string;
} = {}) {
  const eventStore = EventStore.createNull({ events });
  const clock = Clock.fixed(
    fixedInstant ?? "1970-01-01T00:00:00Z",
    "Europe/Berlin",
  );
  const handler = ReportQueryHandler.create({ eventStore, clock });
  return { handler };
}
