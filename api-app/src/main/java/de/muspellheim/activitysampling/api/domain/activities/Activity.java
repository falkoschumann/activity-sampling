// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.Duration;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record Activity(
    LocalDateTime start,
    Duration duration,
    String client,
    String project,
    String task,
    String notes) {

  public static Activity createTestInstance() {
    return new ActivityBuilder()
        .start(LocalDateTime.parse("2024-12-18T09:30"))
        .duration(Duration.ofMinutes(30))
        .client("ACME Inc.")
        .project("Foobar")
        .task("Do something")
        .notes("")
        .build();
  }
}
