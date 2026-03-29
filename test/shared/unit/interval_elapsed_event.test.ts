// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { IntervalElapsedEvent } from "../../../src/shared/domain/interval_elapsed_event";

describe("Interval elapsed event", () => {
  it("should map command", () => {
    const command = IntervalElapsedEvent.createTestInstance();

    const json = JSON.stringify(command);
    const dto = JSON.parse(json);
    const model = IntervalElapsedEvent.create(dto);

    expect(model).toEqual<IntervalElapsedEvent>(
      IntervalElapsedEvent.createTestInstance(),
    );
  });
});
