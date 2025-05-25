// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  queryAuthentication,
  selectAuthentication,
} from "../../src/application/authentication_slice";
import { createStore } from "../../src/application/store";
import { AuthenticationQueryResult } from "../../src/domain/messages";
import { TEST_USER } from "../../src/domain/user";
import { ActivitiesApi } from "../../src/infrastructure/activities_api";
import { AuthenticationApi } from "../../src/infrastructure/authentication_api";
import { NotificationClient } from "../../src/infrastructure/notification_client";
import { Clock } from "../../src/util/clock";
import { Timer } from "../../src/util/timer";

describe("Authentication", () => {
  it("Is authenticated", async () => {
    const json = JSON.stringify({
      isAuthenticated: true,
      user: TEST_USER,
    } as AuthenticationQueryResult);
    const { store } = configure({
      responses: [new Response(json)],
    });

    await store.dispatch(queryAuthentication({}));

    expect(selectAuthentication(store.getState())).toEqual({
      isAuthenticated: true,
      user: TEST_USER,
    });
  });

  it("Is not authenticated", async () => {
    const { store } = configure({
      responses: [
        new Response("", {
          status: 401,
          statusText: "Unauthorized",
        }),
      ],
    });

    await store.dispatch(queryAuthentication({}));

    expect(selectAuthentication(store.getState())).toEqual({
      isAuthenticated: false,
    });
  });

  it("Handles server error", async () => {
    const { store } = configure({
      responses: [
        new Response("", {
          status: 500,
          statusText: "Internal Server Error",
        }),
      ],
    });

    await store.dispatch(queryAuthentication({}));

    expect(selectAuthentication(store.getState())).toEqual({
      isAuthenticated: false,
    });
  });
});

function configure({ responses }: { responses?: Response | Response[] } = {}) {
  const userApi = AuthenticationApi.createNull(responses);
  const store = createStore(
    ActivitiesApi.createNull(),
    userApi,
    NotificationClient.createNull(),
    Clock.createNull(),
    Timer.createNull(),
  );
  return { store, userApi };
}
