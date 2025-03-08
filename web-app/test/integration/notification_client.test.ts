// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { NotificationClient } from "../../src/infrastructure/notification_client";

describe("Notification client", () => {
  it("Has initially unknown permission", () => {
    const client = NotificationClient.createNull();

    expect(client.isUnknown).toBe(true);
  });

  it("Requests permission", async () => {
    const client = NotificationClient.createNull();

    await client.requestPermission();

    expect(client.isGranted).toBe(true);
  });

  it("Shows notification", async () => {
    const client = NotificationClient.createNull();
    await client.requestPermission();
    const shownNotifications = client.trackNotificationsShown();

    client.show("title", "body");

    expect(shownNotifications.data).toEqual([{ title: "title", body: "body" }]);
  });

  it("Closes notification when showing new notification", async () => {
    const client = NotificationClient.createNull();
    await client.requestPermission();
    const shownNotifications = client.trackNotificationsShown();
    const hiddenNotifications = client.trackNotificationsHidden();

    client.show("title1", "body1");
    client.show("title2", "body2");

    expect(shownNotifications.data).toEqual([
      { title: "title1", body: "body1" },
      { title: "title2", body: "body2" },
    ]);
    expect(hiddenNotifications.data).toEqual([
      { title: "title1", body: "body1" },
    ]);
  });

  it("Does not show notification if permission is denied", async () => {
    const client = NotificationClient.createNull({ permission: "denied" });
    await client.requestPermission();
    const shownNotifications = client.trackNotificationsShown();

    client.show("title", "body");

    expect(shownNotifications.data).toEqual([]);
  });

  it("Hides notification", async () => {
    const client = NotificationClient.createNull();
    await client.requestPermission();
    client.show("title", "body");
    const hiddenNotifications = client.trackNotificationsHidden();

    client.hide();

    expect(hiddenNotifications.data).toEqual([
      {
        title: "title",
        body: "body",
      },
    ]);
  });

  it("Does nothing when notification is not shown", async () => {
    const client = NotificationClient.createNull();
    await client.requestPermission();
    const hiddenNotifications = client.trackNotificationsHidden();

    client.hide();

    expect(hiddenNotifications.data).toEqual([]);
  });

  it("Does nothing when notification is already hidden", async () => {
    const client = NotificationClient.createNull();
    await client.requestPermission();
    client.show("title", "body");
    client.hide();
    const hiddenNotifications = client.trackNotificationsHidden();

    client.hide();

    expect(hiddenNotifications.data).toEqual([]);
  });
});
