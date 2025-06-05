// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Duration;
import java.time.Instant;
import lombok.Builder;
import lombok.With;

@Builder
@With
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ActivityLoggedEvent(
    Instant timestamp,
    Duration duration,
    String client,
    String project,
    String task,
    String notes) {

  public static ActivityLoggedEvent createTestInstance() {
    return ActivityLoggedEvent.builder()
        .timestamp(Instant.parse("2024-12-18T08:30:00Z"))
        .duration(Duration.ofMinutes(30))
        .client("ACME Inc.")
        .project("Foobar")
        .task("Do something")
        .build();
  }
}
