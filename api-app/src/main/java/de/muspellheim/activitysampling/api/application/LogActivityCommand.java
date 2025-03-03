// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import java.time.Instant;
import lombok.Builder;
import lombok.With;

@Builder
@With
@JsonInclude(Include.NON_NULL)
public record LogActivityCommand(
    @NotNull Instant start,
    @NotNull Duration duration,
    @NotBlank String client,
    @NotBlank String project,
    @NotBlank String task,
    String notes) {

  public static LogActivityCommand createTestInstance() {
    return new LogActivityCommandBuilder()
        .start(Instant.parse("2024-12-18T09:30:00+01:00"))
        .duration(Duration.ofMinutes(30))
        .client("ACME Inc.")
        .project("Foobar")
        .task("Do something")
        .notes(null)
        .build();
  }
}
