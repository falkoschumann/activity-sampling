/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.application;

public record CommandStatus(boolean success, String errorMessage) {

  public static CommandStatus createSuccess() {
    return new CommandStatus(true, null);
  }

  public static CommandStatus createFailure(String errorMessage) {
    return new CommandStatus(false, errorMessage);
  }
}
