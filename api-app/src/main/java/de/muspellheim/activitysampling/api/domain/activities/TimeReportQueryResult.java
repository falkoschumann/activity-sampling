// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.util.List;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record TimeReportQueryResult(List<TimeReportEntry> entries) {

  public static final TimeReportQueryResult EMPTY =
      TimeReportQueryResult.builder().entries(List.of()).build();

  public static TimeReportQueryResult createTestInstance() {
    return TimeReportQueryResult.builder()
        .entries(List.of(TimeReportEntry.createTestInstance()))
        .build();
  }
}
