// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.util.Map;

@JsonInclude(Include.NON_NULL)
public record CommandStatus(boolean success, String errorMessage, Map<String, Object> details) {

  public static CommandStatus createSuccess() {
    return CommandStatus.createSuccess(Map.of());
  }

  public static CommandStatus createSuccess(Map<String, Object> details) {
    return new CommandStatus(true, null, details);
  }

  public static CommandStatus createFailure(String errorMessage) {
    return CommandStatus.createFailure(errorMessage, Map.of());
  }

  public static CommandStatus createFailure(String errorMessage, Map<String, Object> details) {
    return new CommandStatus(false, errorMessage, details);
  }

  @SuppressWarnings("unchecked")
  public <T> T detail(String key) {
    return (T) details.get(key);
  }
}
