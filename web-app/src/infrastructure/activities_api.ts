// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  CommandStatus,
  Failure,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages";
import { ConfigurableResponses } from "../util/configurable_responses";
import { OutputTracker } from "../util/output_tracker";

const ACTIVITY_LOGGED_EVENT = "activityLogged";

export class ActivitiesApi extends EventTarget {
  static create(): ActivitiesApi {
    return new ActivitiesApi(
      "/api/activities",
      globalThis.fetch.bind(globalThis),
    );
  }

  static createNull(
    responses: Response | Error | (Response | Error)[],
  ): ActivitiesApi {
    return new ActivitiesApi("/stub/activities", createFetchStub(responses));
  }

  readonly #baseUrl: string;
  readonly #fetch: typeof window.fetch;

  constructor(baseUrl: string, fetch: typeof window.fetch) {
    super();
    this.#baseUrl = baseUrl;
    this.#fetch = fetch;
  }

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    try {
      const url = new URL(
        `${this.#baseUrl}/log-activity`,
        window.location.href,
      );
      const response = await this.#fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });
      if (!response.ok) {
        return new Failure(`${response.status}: ${response.statusText}`);
      }

      this.dispatchEvent(
        new CustomEvent(ACTIVITY_LOGGED_EVENT, { detail: command }),
      );
      return response.json();
    } catch (error) {
      return new Failure(String(error));
    }
  }

  trackLoggedActivity() {
    return new OutputTracker<{
      command: LogActivityCommand;
    }>(this, ACTIVITY_LOGGED_EVENT);
  }

  async getRecentActivities(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    const nullObject = {
      workingDays: [],
      timeSummary: {
        hoursToday: "PT0S",
        hoursYesterday: "PT0S",
        hoursThisWeek: "PT0S",
        hoursThisMonth: "PT0S",
      },
    };

    try {
      const url = new URL(
        `${this.#baseUrl}/recent-activities`,
        window.location.href,
      );
      if (query.today) {
        url.searchParams.append("today", query.today);
      }
      if (query.timeZone) {
        url.searchParams.append("timeZone", query.timeZone);
      }
      const response = await this.#fetch(url);
      if (!response.ok) {
        return {
          ...nullObject,
          errorMessage: `${response.status}: ${response.statusText}`,
        };
      }

      const json = await response.text();
      return JSON.parse(json);
    } catch (error) {
      return {
        ...nullObject,
        errorMessage: String(error),
      };
    }
  }
}

function createFetchStub(responses: Response | Error | (Response | Error)[]) {
  const configurableResponses = ConfigurableResponses.create(responses);
  return async () => {
    const response = configurableResponses.next();
    if (response instanceof Error) {
      throw response;
    }

    return response;
  };
}
