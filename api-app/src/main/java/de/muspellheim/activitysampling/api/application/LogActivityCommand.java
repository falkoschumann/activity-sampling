/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.time.Duration;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
@JsonInclude(Include.NON_NULL)
public record LogActivityCommand(
    @NonNull LocalDateTime timestamp,
    @NonNull Duration duration,
    @NonNull String client,
    @NonNull String project,
    @NonNull String task,
    String notes) {

  public static class LogActivityCommandBuilder {
    private LocalDateTime timestamp = LocalDateTime.of(2024, 12, 18, 9, 30);
    private Duration duration = Duration.ofMinutes(30);
    private String client = "ACME Inc.";
    private String project = "Foobar";
    private String task = "Do something";
    private String notes = null;
  }
}
