/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.domain;

import java.time.Duration;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record Activity(
    @NonNull LocalDateTime timestamp,
    @NonNull Duration duration,
    @NonNull String client,
    @NonNull String project,
    @NonNull String task,
    @NonNull String notes) {

  public static class ActivityBuilder {
    private LocalDateTime timestamp = LocalDateTime.parse("2024-12-18T09:30");
    private Duration duration = Duration.ofMinutes(30);
    private String client = "ACME Inc.";
    private String project = "Foobar";
    private String task = "Do something";
    private String notes = "";
  }
}
