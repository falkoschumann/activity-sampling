// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { ActivityLoggedEvent } from "../../../src/shared/domain/activity_logged_event";

describe("Activity logged event", () => {
  it("should map command", () => {
    const command = ActivityLoggedEvent.createTestInstance();

    const json = JSON.stringify(command);
    const dto = JSON.parse(json);
    const model = ActivityLoggedEvent.create(dto);

    expect(model).toEqual<ActivityLoggedEvent>(
      ActivityLoggedEvent.createTestInstance(),
    );
  });
});
