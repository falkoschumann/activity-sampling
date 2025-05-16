// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  Configuration,
  InteractionRequiredAuthError,
  LogLevel,
  PublicClientApplication,
} from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }

        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

export class AuthenticationGateway {
  static create() {
    return new AuthenticationGateway(new PublicClientApplication(msalConfig));
  }

  static createNull({
    name = "Alice",
    username = "alice@example.com",
    token = "nulled-token",
  }: {
    name?: string;
    username?: string;
    token?: string;
  } = {}) {
    return new AuthenticationGateway(
      new PublicClientApplicationStub(
        { name, username },
        token,
      ) as unknown as PublicClientApplication,
    );
  }

  readonly #msalInstance;

  constructor(msalInstance: PublicClientApplication) {
    this.#msalInstance = msalInstance;
  }

  getUser(): { name: string; username: string } {
    const accounts = this.#msalInstance.getAllAccounts();
    return {
      name: accounts[0].name || accounts[0].username,
      username: accounts[0].username,
    };
  }

  async acquireToken() {
    const accounts = this.#msalInstance.getAllAccounts();
    const request = {
      account: accounts[0],
      scopes: import.meta.env.VITE_SCOPES?.split(","),
    };
    try {
      const tokenResponse =
        await this.#msalInstance.acquireTokenSilent(request);
      return tokenResponse.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // TODO Authentication popup may be blocked by the browser
        const tokenResponse =
          await this.#msalInstance.acquireTokenPopup(request);
        return tokenResponse.accessToken;
      }

      console.error("Error acquiring token silently:", error);
      throw error;
    }
  }

  unwrap() {
    return this.#msalInstance;
  }
}

class PublicClientApplicationStub {
  #user;
  #token;

  constructor(user: { name: string; username: string }, token: string) {
    this.#user = user;
    this.#token = token;
  }

  getAllAccounts() {
    return [this.#user];
  }

  async acquireTokenSilent() {
    return { accessToken: this.#token };
  }
}
