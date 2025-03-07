// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  CommandStatus,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages";
import { ConfigurableResponses } from "../util/configurable_responses";
import { OutputTracker } from "../util/output_tracker";

const ACTIVITY_LOGGED_EVENT = "activityLogged";

export class ActivitiesApi extends EventTarget {
  static create(): ActivitiesApi {
    return new ActivitiesApi("/api/activities", globalThis);
  }

  static createNull(
    responses: Response | Error | (Response | Error)[],
  ): ActivitiesApi {
    return new ActivitiesApi("/stub/activities", new GlobalStubImpl(responses));
  }

  readonly #baseUrl: string;
  readonly #global: GlobalStub;

  constructor(baseUrl: string, global: GlobalStub) {
    super();
    this.#baseUrl = baseUrl;
    this.#global = global;
  }

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    try {
      const url = new URL(
        `${this.#baseUrl}/log-activity`,
        window.location.href,
      );
      const response = await this.#global.fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });
      if (!response.ok) {
        return CommandStatus.failure(
          `${response.status}: ${response.statusText}`,
        );
      }

      this.dispatchEvent(
        new CustomEvent(ACTIVITY_LOGGED_EVENT, { detail: command }),
      );
      return response.json();
    } catch (error) {
      return CommandStatus.failure(String(error));
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
      const response = await this.#global.fetch(url);
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

interface GlobalStub {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

class GlobalStubImpl implements GlobalStub {
  #responses;

  constructor(responses: Response | Error | (Response | Error)[]) {
    this.#responses = ConfigurableResponses.create(responses);
  }

  async fetch() {
    const response = this.#responses.next();
    if (response instanceof Error) {
      throw response;
    }

    return response;
  }
}
