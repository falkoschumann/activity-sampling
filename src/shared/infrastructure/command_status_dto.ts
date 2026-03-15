// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { type CommandStatus, Failure, Success } from "@muspellheim/shared";

export class CommandStatusDto {
  static create({
    isSuccess,
    errorMessage,
  }: {
    isSuccess: boolean;
    errorMessage?: string;
  }): CommandStatusDto {
    return new CommandStatusDto(isSuccess, errorMessage);
  }

  static fromModel(model: CommandStatus): CommandStatusDto {
    if (model.isSuccess) {
      return new CommandStatusDto(true);
    }

    return CommandStatusDto.create({
      isSuccess: model.isSuccess,
      errorMessage: model.errorMessage,
    });
  }

  readonly isSuccess: boolean;
  readonly errorMessage?: string;

  private constructor(isSuccess: boolean, errorMessage?: string) {
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
  }

  validate(): CommandStatus {
    return this.isSuccess ? new Success() : new Failure(this.errorMessage!);
  }
}
