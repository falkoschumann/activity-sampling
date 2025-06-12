// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record TimesheetQueryResult(
    List<TimesheetEntry> entries, WorkingHoursSummary workingHoursSummary, ZoneId timeZone) {

  public static final TimesheetQueryResult EMPTY =
      new TimesheetQueryResult(List.of(), WorkingHoursSummary.EMPTY, ZoneId.systemDefault());

  public static TimesheetQueryResult createTestInstance() {
    return TimesheetQueryResult.builder()
        .entries(
            List.of(
                TimesheetEntry.createTestInstance().withDate(LocalDate.parse("2025-06-02")),
                TimesheetEntry.createTestInstance().withDate(LocalDate.parse("2025-06-03"))))
        .workingHoursSummary(WorkingHoursSummary.createTestInstance())
        .timeZone(ZoneId.of("Europe/Berlin"))
        .build();
  }
}
