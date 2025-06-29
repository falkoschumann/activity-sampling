// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.Duration;
import java.util.List;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record ReportQueryResult(List<ReportEntry> entries, Duration totalHours) {

  public static final ReportQueryResult EMPTY =
      ReportQueryResult.builder().entries(List.of()).totalHours(Duration.ZERO).build();

  public static ReportQueryResult createTestInstance() {
    return ReportQueryResult.builder()
        .entries(List.of(ReportEntry.createTestInstance()))
        .totalHours(Duration.ofHours(42))
        .build();
  }
}
