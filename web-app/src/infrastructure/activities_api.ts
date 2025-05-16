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
    return new ActivitiesApi(
      "/api/activities",
      globalThis.fetch.bind(globalThis),
    );
  }

  static createNull(
    responses?: Response | Error | (Response | Error)[],
  ): ActivitiesApi {
    return new ActivitiesApi("/nulled/activities", createFetchStub(responses));
  }

  readonly #baseUrl;
  readonly #fetch;

  constructor(baseUrl: string, fetch: typeof window.fetch) {
    super();
    this.#baseUrl = baseUrl;
    this.#fetch = fetch;
  }

  async logActivity(
    command: LogActivityCommand,
    bearerToken: string,
  ): Promise<CommandStatus> {
    const url = new URL(`${this.#baseUrl}/log-activity`, window.location.href);
    const response = await this.#fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(command),
    });
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    this.dispatchEvent(
      new CustomEvent(ACTIVITY_LOGGED_EVENT, { detail: command }),
    );
    return response.json();
  }

  trackActivitiesLogged() {
    return new OutputTracker<{
      command: LogActivityCommand;
    }>(this, ACTIVITY_LOGGED_EVENT);
  }

  async queryRecentActivities(
    query: RecentActivitiesQuery,
    bearerToken: string,
  ): Promise<RecentActivitiesQueryResult> {
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
    const response = await this.#fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const json = await response.text();
    return JSON.parse(json);
  }
}

function createFetchStub(responses?: Response | Error | (Response | Error)[]) {
  const configurableResponses = ConfigurableResponses.create(responses);
  return async () => {
    const response = configurableResponses.next();
    if (response instanceof Error) {
      throw response;
    }

    return response;
  };
}
