// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  type AuthenticationQueryResult,
  createTestAccountInfo,
} from "../../src/domain/authentication";
import { AuthenticationApi } from "../../src/infrastructure/authentication_api";

describe("Authentication API", () => {
  it("Returns authentication", async () => {
    const api = AuthenticationApi.createNull(
      new Response(
        JSON.stringify({
          isAuthenticated: true,
          account: createTestAccountInfo(),
        } as AuthenticationQueryResult),
        { status: 200 },
      ),
    );

    const user = await api.queryAuthentication({});

    expect(user).toEqual({
      isAuthenticated: true,
      account: createTestAccountInfo(),
    });
  });

  it("Returns unauthenticated", async () => {
    const api = AuthenticationApi.createNull(
      new Response(
        JSON.stringify({
          isAuthenticated: false,
        } as AuthenticationQueryResult),
        { status: 200 },
      ),
    );

    const user = await api.queryAuthentication({});

    expect(user).toEqual({ isAuthenticated: false });
  });

  it("Handles server error", async () => {
    const api = AuthenticationApi.createNull(
      new Response("", { status: 500, statusText: "Internal Server Error" }),
    );

    const result = api.queryAuthentication({});

    await expect(result).rejects.toThrow("500: Internal Server Error");
  });

  it("Handles network error", async () => {
    const api = AuthenticationApi.createNull(new Error("Network Error"));

    const result = api.queryAuthentication({});

    await expect(result).rejects.toThrow("Network Error");
  });
});
