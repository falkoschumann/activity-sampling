// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Duration;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.With;

@Builder
@With
@JsonInclude(JsonInclude.Include.NON_NULL)
public record Activity(
    LocalDateTime timestamp,
    Duration duration,
    String client,
    String project,
    String task,
    String notes) {

  public static Activity createTestInstance() {
    return Activity.builder()
        .timestamp(LocalDateTime.parse("2024-12-18T09:30"))
        .duration(Duration.ofMinutes(30))
        .client("Test client")
        .project("Test project")
        .task("Test task")
        .build();
  }
}
