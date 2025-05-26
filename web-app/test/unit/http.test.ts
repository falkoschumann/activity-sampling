// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { HttpError, verifyResponse } from "../../src/util/http";

describe("HTTP", () => {
  describe("Verify response", () => {
    it("Returns silently if response is ok", async () => {
      const response = new Response("OK", { status: 200 });

      expect(() => verifyResponse(response)).not.toThrow();
    });

    it("Throws error if response is not ok", async () => {
      const response = new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
      });

      expect(() => verifyResponse(response)).toThrow(
        new HttpError(404, "Not Found"),
      );
    });
  });
});
