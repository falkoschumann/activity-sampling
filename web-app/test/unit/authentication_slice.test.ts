// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  queryAuthentication,
  selectAuthentication,
} from "../../src/application/authentication_slice";
import { createStore } from "../../src/application/store";
import { Clock } from "../../src/common/clock";
import { Timer } from "../../src/common/timer";
import {
  AuthenticationQueryResult,
  createTestAccountInfo,
} from "../../src/domain/authentication";
import { ActivitiesApi } from "../../src/infrastructure/activities_api";
import { AuthenticationApi } from "../../src/infrastructure/authentication_api";
import { NotificationClient } from "../../src/infrastructure/notification_client";

describe("Authentication", () => {
  it("Is authenticated", async () => {
    const json = JSON.stringify({
      isAuthenticated: true,
      account: createTestAccountInfo(),
    } as AuthenticationQueryResult);
    const { store } = configure({
      responses: [new Response(json)],
    });

    await store.dispatch(queryAuthentication({}));

    expect(selectAuthentication(store.getState())).toEqual({
      isAuthenticated: true,
      account: createTestAccountInfo(),
    });
  });

  it("Is not authenticated", async () => {
    const json = JSON.stringify({
      isAuthenticated: false,
    } as AuthenticationQueryResult);
    const { store } = configure({
      responses: [new Response(json)],
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
  const activitiesApi = ActivitiesApi.createNull();
  const authenticationApi = AuthenticationApi.createNull(responses);
  const notificationClient = NotificationClient.createNull();
  const clock = Clock.createNull();
  const timer = Timer.createNull();
  const store = createStore({
    activitiesApi,
    authenticationApi,
    notificationClient,
    clock,
    timer,
  });
  return { store };
}
