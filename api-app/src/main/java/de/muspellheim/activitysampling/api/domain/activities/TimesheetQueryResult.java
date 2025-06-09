// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.time.Duration;
import java.time.ZoneId;
import java.util.List;
import lombok.Builder;
import lombok.With;

@Builder
@With
@JsonInclude(Include.NON_NULL)
public record TimesheetQueryResult(
    List<TimesheetEntry> entries, Duration totalHours, ZoneId timeZone) {

  public static final TimesheetQueryResult EMPTY =
      new TimesheetQueryResult(List.of(), Duration.ZERO, ZoneId.systemDefault());

  public static TimesheetQueryResult createTestInstance() {
    return TimesheetQueryResult.builder()
        .entries(List.of()) // TODO add example entries
        .timeZone(ZoneId.of("Europe/Berlin"))
        .build();
  }
}
