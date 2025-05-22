// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { User } from "../domain/user";
import { ConfigurableResponses } from "../util/configurable_responses";
import { verifyResponse } from "../util/http";

export class UserApi {
  static create(): UserApi {
    return new UserApi("/api/user", globalThis.fetch.bind(globalThis));
  }

  static createNull(
    responses?: Response | Error | (Response | Error)[],
  ): UserApi {
    return new UserApi("/nulled/user", createFetchStub(responses));
  }

  readonly #url;
  readonly #fetch;

  constructor(url: string, fetch: typeof window.fetch) {
    this.#url = url;
    this.#fetch = fetch;
  }

  async getUser(): Promise<User> {
    const url = new URL(this.#url, window.location.href);
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
