/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.time.Duration;
import java.time.Instant;
import lombok.Builder;
import lombok.NonNull;

@Builder
@JsonInclude(Include.NON_NULL)
public record LogActivityCommand(
    @NonNull Instant timestamp,
    @NonNull Duration duration,
    @NonNull String client,
    @NonNull String project,
    @NonNull String task,
    String notes) {

  public static class LogActivityCommandBuilder {
    private Instant timestamp = Instant.parse("2024-12-18T09:30:00+01:00");
    private Duration duration = Duration.ofMinutes(30);
    private String client = "ACME Inc.";
    private String project = "Foobar";
    private String task = "Do something";
    private String notes = null;
  }
}
