// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";
import { Success } from "../../src/common/messages";

import {
  createTestLogActivityCommand,
  createTestRecentActivitiesQuery,
  createTestRecentActivitiesQueryResult,
  createTestTimesheetQuery,
  createTestTimesheetQueryResult,
} from "../../src/domain/activities";
import { ActivitiesApi } from "../../src/infrastructure/activities_api";

describe("Activities API", () => {
  describe("Log activity", () => {
    it("Logs successfully activity", async () => {
      const api = ActivitiesApi.createNull(
        new Response(JSON.stringify(new Success()), { status: 200 }),
      );
      const loggedActivities = api.trackActivitiesLogged();

      const status = await api.logActivity(createTestLogActivityCommand());

      expect(status).toEqual(new Success());
      expect(loggedActivities.data).toEqual([createTestLogActivityCommand()]);
    });

    it("Handles server error", async () => {
      const api = ActivitiesApi.createNull(
        new Response("", { status: 500, statusText: "Internal Server Error" }),
      );

      const result = api.logActivity(createTestLogActivityCommand());

      await expect(result).rejects.toThrow("500: Internal Server Error");
    });

    it("Handles network error", async () => {
      const api = ActivitiesApi.createNull(new Error("Network Error"));

      const result = api.logActivity(createTestLogActivityCommand());

      await expect(result).rejects.toThrow("Network Error");
    });
  });

  describe("Recent activities", () => {
    it("Queries recent activities", async () => {
      const api = ActivitiesApi.createNull(
        new Response(JSON.stringify(createTestRecentActivitiesQueryResult()), {
          status: 200,
        }),
      );

      const result = await api.queryRecentActivities(
        createTestRecentActivitiesQuery(),
      );

      expect(result).toEqual(createTestRecentActivitiesQueryResult());
    });

    it("Handles server error", async () => {
      const api = ActivitiesApi.createNull(
        new Response("", { status: 500, statusText: "Internal Server Error" }),
      );

      const result = api.queryRecentActivities(
        createTestRecentActivitiesQuery(),
      );

      await expect(result).rejects.toThrow("500: Internal Server Error");
    });

    it("Handles network error", async () => {
      const api = ActivitiesApi.createNull(new Error("Network Error"));

      const result = api.queryRecentActivities(
        createTestRecentActivitiesQuery(),
      );

      await expect(result).rejects.toThrow("Network Error");
    });
  });

  describe("Timesheet", () => {
    it("Queries timesheet", async () => {
      const api = ActivitiesApi.createNull(
        new Response(JSON.stringify(createTestTimesheetQueryResult()), {
          status: 200,
        }),
      );

      const result = await api.queryTimesheet(createTestTimesheetQuery());

      expect(result).toEqual(createTestTimesheetQueryResult());
    });

    it("Handles server error", async () => {
      const api = ActivitiesApi.createNull(
        new Response("", { status: 500, statusText: "Internal Server Error" }),
      );

      const result = api.queryTimesheet(createTestTimesheetQuery());

      await expect(result).rejects.toThrow("500: Internal Server Error");
    });

    it("Handles network error", async () => {
      const api = ActivitiesApi.createNull(new Error("Network Error"));

      const result = api.queryTimesheet(createTestTimesheetQuery());

      await expect(result).rejects.toThrow("Network Error");
    });
  });
});
