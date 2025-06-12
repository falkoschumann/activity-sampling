// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.Duration;
import java.time.LocalDate;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record TimesheetEntry(
    LocalDate date, String client, String project, String task, Duration hours) {

  public static TimesheetEntry createTestInstance() {
    return TimesheetEntry.builder()
        .date(LocalDate.parse("2025-06-04"))
        .client("Test client")
        .project("Test project")
        .task("Test task")
        .hours(Duration.ofHours(2))
        .build();
  }
}
