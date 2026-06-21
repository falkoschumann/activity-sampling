// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { NotificationsAdapter } from "../../../src/main/infrastructure/notifications_adapter";

describe("Notification adapter", () => {
  it("should show notification", async () => {
    const adapter = NotificationsAdapter.createNull();
    const showTracked = adapter.trackShow();

    await adapter.show({ title: "my-title" });

    expect(showTracked.data).toEqual([{ title: "my-title" }]);
  });

  it("should hide notification when showing another one", async () => {
    const adapter = NotificationsAdapter.createNull();
    await adapter.show({ title: "my-title" });
    const hideTracked = adapter.trackHide();

    await adapter.hide();

    expect(hideTracked.data).toEqual(["hidden"]);
  });

  it("should not hide notification when not showing another one", async () => {
    const adapter = NotificationsAdapter.createNull();
    const hideTracked = adapter.trackHide();

    await adapter.hide();

    expect(hideTracked.data).toEqual([]);
  });

  it("should emit click event", async () => {
    const adapter = NotificationsAdapter.createNull();
    let clicked = false;
    await adapter.show({
      title: "my-title",
      onClick: () => (clicked = true),
    });

    adapter.simulateClick();

    expect(clicked).toBe(true);
  });

  it.todo("should emit reply event");
});
