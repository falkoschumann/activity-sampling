// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  Configuration,
  LogLevel,
  PublicClientApplication,
} from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
    // TODO Can URIs be deleted? Because they are configured in Entra ID.
    redirectUri: window.location.href,
    // TODO Use /logout do clear sessionStorage
    postLogoutRedirectUri: window.location.href,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
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

console.log("Configuration", msalConfig);

export const msalInstance = new PublicClientApplication(msalConfig);

export const loginRequest = {
  scopes: import.meta.env.VITE_SCOPES.split(","),
};
