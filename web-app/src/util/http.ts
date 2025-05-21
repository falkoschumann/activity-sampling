// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export function verifyResponse(response: Response): void {
  if (response.ok) {
    return;
  }

  if (response.status === 401) {
    // Unauthorized, redirect to login page
    window.location.replace("/oauth2/authorization/azure");
  }

  throw new HttpError(response.status, response.statusText);
}

export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(`${status}: ${statusText}`);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
  }
}
