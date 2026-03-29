// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../../../src/shared/domain/recent_activities_query";

describe("Recent activities query", () => {
  it("should map query", () => {
    const query = RecentActivitiesQuery.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = RecentActivitiesQuery.create(dto);

    expect(model).toEqual<RecentActivitiesQuery>(
      RecentActivitiesQuery.createTestInstance(),
    );
  });

  it("should map an empty query result", () => {
    const query = RecentActivitiesQueryResult.create();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = RecentActivitiesQueryResult.create(dto);

    expect(model).toEqual<RecentActivitiesQueryResult>(
      RecentActivitiesQueryResult.create(),
    );
  });

  it("should map query result", () => {
    const query = RecentActivitiesQueryResult.createTestInstance();

    const json = JSON.stringify(query);
    const dto = JSON.parse(json);
    const model = RecentActivitiesQueryResult.create(dto);

    expect(model).toEqual<RecentActivitiesQueryResult>(
      RecentActivitiesQueryResult.createTestInstance(),
    );
  });
});
