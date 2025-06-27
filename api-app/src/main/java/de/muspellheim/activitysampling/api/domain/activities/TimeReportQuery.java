// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.LocalDate;
import java.time.ZoneId;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record TimeReportQuery(Scope scope, LocalDate from, LocalDate to, ZoneId timeZone) {

  public static TimeReportQuery createTestInstance() {
    return TimeReportQuery.builder()
        .scope(Scope.PROJECT)
        .from(LocalDate.of(2025, 6, 1))
        .to(LocalDate.of(2025, 6, 30))
        .timeZone(ZoneId.of("Europe/Berlin"))
        .build();
  }
}
