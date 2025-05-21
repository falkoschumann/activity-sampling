// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  CommandStatus,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages";
import { ConfigurableResponses } from "../util/configurable_responses";
import { verifyResponse } from "../util/http";
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

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    const url = new URL(`${this.#baseUrl}/log-activity`, window.location.href);
    const response = await this.#fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    verifyResponse(response);
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
    const response = await this.#fetch(url);
    verifyResponse(response);
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
