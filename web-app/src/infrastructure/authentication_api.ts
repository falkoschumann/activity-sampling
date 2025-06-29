// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { ConfigurableResponses } from "../common/configurable_responses";

import type {
  AuthenticationQuery,
  AuthenticationQueryResult,
} from "../domain/authentication";
import { verifyResponse } from "./http";

export class AuthenticationApi {
  static create(): AuthenticationApi {
    return new AuthenticationApi(
      "/api/authentication",
      globalThis.fetch.bind(globalThis),
    );
  }

  static createNull(
    responses?: Response | Error | (Response | Error)[],
  ): AuthenticationApi {
    return new AuthenticationApi(
      "/nulled/authentication",
      createFetchStub(responses),
    );
  }

  readonly #url;
  readonly #fetch;

  constructor(url: string, fetch: typeof window.fetch) {
    this.#url = url;
    this.#fetch = fetch;
  }

  async queryAuthentication(
    _query: AuthenticationQuery,
  ): Promise<AuthenticationQueryResult> {
    const url = new URL(this.#url, window.location.href);
    const response = await this.#fetch(url, { redirect: "error" });
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
