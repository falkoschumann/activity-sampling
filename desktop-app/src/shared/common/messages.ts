// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class CommandStatus {
  static success(): CommandStatus {
    return new CommandStatus(true);
  }

  static failure(errorMessage: string): CommandStatus {
    return new CommandStatus(false, errorMessage);
  }

  readonly success: boolean;
  readonly errorMessage?: string;

  constructor(success: boolean, errorMessage?: string) {
    this.success = success;
    this.errorMessage = errorMessage;
  }
}
