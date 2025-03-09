// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { TEST_ACTIVITY } from "../../src/domain/activities";
import { Failure, Success } from "../../src/domain/messages";
import { ActivitiesApi } from "../../src/infrastructure/activities_api";

describe("Activities API", () => {
  describe("Log activity", () => {
    it("Logs successfully activity", async () => {
      const api = ActivitiesApi.createNull(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

      const status = await api.logActivity(TEST_ACTIVITY);

      expect(status).toEqual(new Success());
    });

    it("Handles server error", async () => {
      const api = ActivitiesApi.createNull(
        new Response("", { status: 500, statusText: "Internal Server Error" }),
      );

      const status = await api.logActivity(TEST_ACTIVITY);

      expect(status).toEqual(new Failure("500: Internal Server Error"));
    });

    it("Handles network error", async () => {
      const api = ActivitiesApi.createNull(new Error("Network Error"));

      const status = await api.logActivity(TEST_ACTIVITY);

      expect(status).toEqual(new Failure("Error: Network Error"));
    });
  });

  describe("Recent activities", () => {
    it("Gets successfully activities", async () => {
      const api = ActivitiesApi.createNull(
        new Response(
          JSON.stringify({
            workingDays: [],
            timeSummary: {
              hoursToday: "PT0S",
              hoursYesterday: "PT0S",
              hoursThisWeek: "PT0S",
              hoursThisMonth: "PT0S",
            },
          }),
          { status: 200 },
        ),
      );

      const result = await api.getRecentActivities({});

      expect(result).toEqual({
        workingDays: [],
        timeSummary: {
          hoursToday: "PT0S",
          hoursYesterday: "PT0S",
          hoursThisWeek: "PT0S",
          hoursThisMonth: "PT0S",
        },
      });
    });

    it("Handles server error", async () => {
      const api = ActivitiesApi.createNull(
        new Response("", { status: 500, statusText: "Internal Server Error" }),
      );

      const result = await api.getRecentActivities({});

      expect(result).toEqual({
        workingDays: [],
        timeSummary: {
          hoursToday: "PT0S",
          hoursYesterday: "PT0S",
          hoursThisWeek: "PT0S",
          hoursThisMonth: "PT0S",
        },
        errorMessage: "500: Internal Server Error",
      });
    });

    it("Handles network error", async () => {
      const api = ActivitiesApi.createNull(new Error("Network Error"));

      const result = await api.getRecentActivities({});

      expect(result).toEqual({
        workingDays: [],
        timeSummary: {
          hoursToday: "PT0S",
          hoursYesterday: "PT0S",
          hoursThisWeek: "PT0S",
          hoursThisMonth: "PT0S",
        },
        errorMessage: "Error: Network Error",
      });
    });
  });
});
