/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.domain.Activity;
import de.muspellheim.activitysampling.api.domain.TimeSummary;
import de.muspellheim.activitysampling.api.domain.WorkingDay;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record RecentActivitiesQueryResult(
    Activity lastActivity, List<WorkingDay> workingDays, TimeSummary timeSummary) {

  public static final RecentActivitiesQueryResult NULL =
      new RecentActivitiesQueryResult(null, List.of(), TimeSummary.NULL);

  public static RecentActivitiesQueryResult createTestInstance() {
    return new RecentActivitiesQueryResult(
        Activity.builder().timestamp(LocalDateTime.of(2024, 12, 18, 9, 30)).build(),
        List.of(
            new WorkingDay(
                LocalDate.of(2024, 12, 18),
                List.of(
                    Activity.builder().timestamp(LocalDateTime.of(2024, 12, 18, 9, 30)).build())),
            new WorkingDay(
                LocalDate.of(2024, 12, 17),
                List.of(
                    Activity.builder().timestamp(LocalDateTime.of(2024, 12, 17, 17, 0)).build(),
                    Activity.builder().timestamp(LocalDateTime.of(2024, 12, 17, 16, 30)).build(),
                    Activity.builder()
                        .timestamp(LocalDateTime.of(2024, 12, 17, 16, 0))
                        .task("Make things")
                        .notes("This is a note")
                        .build()))),
        new TimeSummary(
            Duration.ofMinutes(30),
            Duration.ofMinutes(90),
            Duration.ofMinutes(120),
            Duration.ofMinutes(120)));
  }
}
