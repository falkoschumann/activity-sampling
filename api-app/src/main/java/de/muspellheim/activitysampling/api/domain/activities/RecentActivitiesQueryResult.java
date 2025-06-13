// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import lombok.Builder;
import lombok.With;

@Builder
@With
@JsonInclude(Include.NON_NULL)
public record RecentActivitiesQueryResult(
    Activity lastActivity, List<WorkingDay> workingDays, TimeSummary timeSummary, ZoneId timeZone) {

  public static final RecentActivitiesQueryResult EMPTY =
      new RecentActivitiesQueryResult(null, List.of(), TimeSummary.NULL, ZoneId.systemDefault());

  public static RecentActivitiesQueryResult createTestInstance() {
    return RecentActivitiesQueryResult.builder()
        .lastActivity(
            Activity.createTestInstance().withDateTime(LocalDateTime.parse("2025-06-04T09:30")))
        .workingDays(
            List.of(
                new WorkingDay(
                    LocalDate.parse("2025-06-04"),
                    List.of(
                        Activity.createTestInstance()
                            .withDateTime(LocalDateTime.parse("2025-06-04T09:30")))),
                new WorkingDay(
                    LocalDate.parse("2025-06-03"),
                    List.of(
                        Activity.createTestInstance()
                            .withDateTime(LocalDateTime.parse("2025-06-03T17:00")),
                        Activity.createTestInstance()
                            .withDateTime(LocalDateTime.parse("2025-06-03T16:30")),
                        Activity.createTestInstance()
                            .withDateTime(LocalDateTime.parse("2025-06-03T16:00"))
                            .withTask("Other task")
                            .withNotes("Other notes")))))
        .timeSummary(
            new TimeSummary(
                Duration.ofMinutes(30),
                Duration.ofMinutes(90),
                Duration.ofMinutes(120),
                Duration.ofMinutes(120)))
        .timeZone(ZoneId.of("Europe/Berlin"))
        .build();
  }
}
