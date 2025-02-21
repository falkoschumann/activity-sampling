// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  CommandStatus,
  LogActivityCommand,
  RecentActivitiesQuery,
  RecentActivitiesQueryResult,
} from "../domain/messages.ts";
import { OutputTracker } from "../util/output_tracker.ts";
import { ConfigurableResponses } from "../util/configurable_responses.ts";

const ACTIVITY_LOGGED_EVENT = "activityLogged";

export class ActivitiesApi extends EventTarget {
  static create(): ActivitiesApi {
    return new ActivitiesApi("/api/activities", globalThis);
  }

  static createNull(responses: Response | Response[]): ActivitiesApi {
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
    const url = new URL(`${this.#baseUrl}/log-activity`, window.location.href);
    const response = await this.#global.fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    this.dispatchEvent(
      new CustomEvent(ACTIVITY_LOGGED_EVENT, { detail: command }),
    );
    return response.json();
  }

  trackLoggedActivity() {
    return new OutputTracker(this, ACTIVITY_LOGGED_EVENT);
  }

  async getRecentActivities(
    query: RecentActivitiesQuery,
  ): Promise<RecentActivitiesQueryResult> {
    // TODO Use fetch stub
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
    const json = await response.text();
    return JSON.parse(json);
  }
}

interface GlobalStub {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

class GlobalStubImpl implements GlobalStub {
  #responses;

  constructor(responses: Response | Response[]) {
    this.#responses = ConfigurableResponses.create(responses);
  }

  fetch() {
    const response = this.#responses.next();
    return Promise.resolve(response);
  }
}
