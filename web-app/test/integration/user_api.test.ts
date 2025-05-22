// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";
import { TEST_USER } from "../../src/domain/user";
import { UserApi } from "../../src/infrastructure/user_api";

describe("User API", () => {
  it("Returns user", async () => {
    const api = UserApi.createNull(
      new Response(JSON.stringify(TEST_USER), { status: 200 }),
    );

    const user = await api.getUser();

    expect(user).toEqual(TEST_USER);
  });

  it("Handles server error", async () => {
    const api = UserApi.createNull(
      new Response("", { status: 500, statusText: "Internal Server Error" }),
    );

    const result = api.getUser();

    await expect(result).rejects.toThrow("500: Internal Server Error");
  });

  it("Handles network error", async () => {
    const api = UserApi.createNull(new Error("Network Error"));

    const result = api.getUser();

    await expect(result).rejects.toThrow("Network Error");
  });
});
