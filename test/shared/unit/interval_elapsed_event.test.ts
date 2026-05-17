// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { IntervalElapsedEvent } from "../../../src/shared/domain/interval_elapsed_event";

describe("Interval elapsed event", () => {
  it("should map command", () => {
    const json = JSON.stringify(IntervalElapsedEvent.createTestInstance());
    const dto = JSON.parse(json);
    const model = IntervalElapsedEvent.create(dto);

    expect(model).toEqual<IntervalElapsedEvent>(
      IntervalElapsedEvent.createTestInstance(),
    );
  });
});
