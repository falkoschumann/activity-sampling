// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  queryAuthentication,
  selectAuthentication,
} from "../../src/application/authentication_slice";
import { configureNullStore } from "../../src/application/store";
import {
  AuthenticationQueryResult,
  createTestAccountInfo,
} from "../../src/domain/authentication";

describe("Authentication", () => {
  it("Is authenticated", async () => {
    const json = JSON.stringify({
      isAuthenticated: true,
      account: createTestAccountInfo(),
    } as AuthenticationQueryResult);
    const { store } = configureNullStore({
      authenticationResponses: [new Response(json)],
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
    const { store } = configureNullStore({
      authenticationResponses: [new Response(json)],
    });

    await store.dispatch(queryAuthentication({}));

    expect(selectAuthentication(store.getState())).toEqual({
      isAuthenticated: false,
    });
  });

  it("Handles server error", async () => {
    const { store } = configureNullStore({
      authenticationResponses: [
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
