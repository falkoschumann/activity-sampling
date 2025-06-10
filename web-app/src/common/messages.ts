// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export type CommandStatus = Success | Failure;

export class Success {
  readonly success = true;
}

export class Failure {
  readonly success = false;
  readonly errorMessage: string;

  constructor(errorMessage: string) {
    this.errorMessage = errorMessage;
  }
}
