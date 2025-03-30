// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { PublicClientApplication } from "@azure/msal-browser";
import {
  CommandStatus,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages";
import { ConfigurableResponses } from "../util/configurable_responses";
import { OutputTracker } from "../util/output_tracker";
import { loginRequest, msalInstance } from "./authentication_gateway";

const ACTIVITY_LOGGED_EVENT = "activityLogged";

export class ActivitiesApi extends EventTarget {
  static create(): ActivitiesApi {
    return new ActivitiesApi(
      "/api/activities",
      globalThis.fetch.bind(globalThis),
      msalInstance,
    );
  }

  static createNull(
    responses?: Response | Error | (Response | Error)[],
  ): ActivitiesApi {
    return new ActivitiesApi(
      "/nulled/activities",
      createFetchStub(responses),
      createMsalInstance(),
    );
  }

  readonly #baseUrl;
  readonly #fetch;
  readonly #msalInstance;

  constructor(
    baseUrl: string,
    fetch: typeof window.fetch,
    msalInstance: PublicClientApplication,
  ) {
    super();
    this.#baseUrl = baseUrl;
    this.#fetch = fetch;
    this.#msalInstance = msalInstance;
  }

  async logActivity(command: LogActivityCommand): Promise<CommandStatus> {
    const url = new URL(`${this.#baseUrl}/log-activity`, window.location.href);
    const token = await this.#acquireToken();
    const response = await this.#fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    const token = await this.#acquireToken();
    const response = await this.#fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    const json = await response.text();
    return JSON.parse(json);
  }

  async #acquireToken() {
    try {
      const accounts = this.#msalInstance.getAllAccounts();
      const tokenResponse = await this.#msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return tokenResponse.accessToken;
    } catch (error) {
      console.error("Error acquiring token silently:", error);
      throw error;
    }
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

function createMsalInstance() {
  return {
    getAllAccounts: () => [{}],
    acquireTokenSilent: () => ({ accessToken: "fake-token" }),
  } as unknown as PublicClientApplication;
}
