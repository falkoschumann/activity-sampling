// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { NotificationsGateway } from "../../../src/main/infrastructure/notifications.gateway";

describe("Notifications", () => {
  it("should show notification", async () => {
    const adapter = NotificationsGateway.createNull();
    const showTracked = adapter.trackShow();

    await adapter.show({ title: "Test title" });

    expect(showTracked.data).toEqual([{ title: "Test title" }]);
  });

  it("should hide notification when showing another one", async () => {
    const adapter = NotificationsGateway.createNull();
    await adapter.show({ title: "Test title" });
    const hideTracked = adapter.trackHide();

    await adapter.hide();

    expect(hideTracked.data).toEqual(["hidden"]);
  });

  it("should not hide notification when not showing another one", async () => {
    const adapter = NotificationsGateway.createNull();
    const hideTracked = adapter.trackHide();

    await adapter.hide();

    expect(hideTracked.data).toEqual([]);
  });

  it("should emit click event", async () => {
    const adapter = NotificationsGateway.createNull();
    let clicked = false;
    await adapter.show({
      title: "Test title",
      onClick: () => (clicked = true),
    });

    adapter.simulateClick();

    expect(clicked).toBe(true);
  });

  it.todo("should emit reply event");
});
