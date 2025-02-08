/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.domain;

import java.time.Duration;
import java.time.Instant;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record Activity(
    @NonNull Instant timestamp,
    @NonNull Duration duration,
    @NonNull String client,
    @NonNull String project,
    @NonNull String task,
    @NonNull String notes) {

  public static class ActivityBuilder {
    private Instant timestamp = Instant.parse("2024-12-18T09:30:00+01:00");
    private Duration duration = Duration.ofMinutes(30);
    private String client = "ACME Inc.";
    private String project = "Foobar";
    private String task = "Do something";
    private String notes = "";
  }
}
