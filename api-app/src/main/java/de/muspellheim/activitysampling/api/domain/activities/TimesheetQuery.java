// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.time.LocalDate;
import java.time.ZoneId;
import lombok.Builder;
import lombok.With;

@Builder
@With
@JsonInclude(Include.NON_NULL)
public record TimesheetQuery(LocalDate startInclusive, LocalDate endExclusive, ZoneId timeZone) {

  public static TimesheetQuery createTestInstance() {
    return TimesheetQuery.builder()
        .startInclusive(LocalDate.of(2025, 6, 2))
        .endExclusive(LocalDate.of(2025, 6, 9))
        .timeZone(ZoneId.of("Europe/Berlin"))
        .build();
  }
}
