// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export type CommandStatus = Success | Failure;

export interface Success {
  readonly success: true;
}

export function createSuccess(): Success {
  return { success: true };
}

export interface Failure {
  readonly success: false;
  readonly errorMessage: string;
}

export function createFailure(errorMessage: string): Failure {
  return { success: false, errorMessage };
}
