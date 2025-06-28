// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.time.Duration;
import lombok.Builder;
import lombok.With;

@Builder
@With
@JsonInclude(Include.NON_NULL)
public record ReportEntry(String name, String client, Duration hours) {

  public static ReportEntry createTestInstance() {
    return ReportEntry.builder()
        .name("Test project")
        .client("Test client")
        .hours(Duration.ofHours(42))
        .build();
  }
}
