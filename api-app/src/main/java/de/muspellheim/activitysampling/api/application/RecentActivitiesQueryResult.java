/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import de.muspellheim.activitysampling.api.domain.Activity;
import de.muspellheim.activitysampling.api.domain.TimeSummary;
import de.muspellheim.activitysampling.api.domain.WorkingDay;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
@JsonInclude(Include.NON_NULL)
public record RecentActivitiesQueryResult(
    Activity lastActivity,
    @NonNull List<WorkingDay> workingDays,
    @NonNull TimeSummary timeSummary,
    @NonNull ZoneId timeZone) {

  public static final RecentActivitiesQueryResult NULL =
      new RecentActivitiesQueryResult(null, List.of(), TimeSummary.NULL, ZoneId.systemDefault());

  public static class RecentActivitiesQueryResultBuilder {
    private Activity lastActivity =
        Activity.builder().timestamp(LocalDateTime.parse("2024-12-18T09:30")).build();
    private List<WorkingDay> workingDays =
        List.of(
            new WorkingDay(
                LocalDate.of(2024, 12, 18),
                List.of(
                    Activity.builder().timestamp(LocalDateTime.parse("2024-12-18T09:30")).build())),
            new WorkingDay(
                LocalDate.of(2024, 12, 17),
                List.of(
                    Activity.builder().timestamp(LocalDateTime.parse("2024-12-17T17:00")).build(),
                    Activity.builder().timestamp(LocalDateTime.parse("2024-12-17T16:30")).build(),
                    Activity.builder()
                        .timestamp(LocalDateTime.parse("2024-12-17T16:00"))
                        .task("Make things")
                        .notes("This is a note")
                        .build())));
    private TimeSummary timeSummary =
        new TimeSummary(
            Duration.ofMinutes(30),
            Duration.ofMinutes(90),
            Duration.ofMinutes(120),
            Duration.ofMinutes(120));
    private ZoneId timeZone = ZoneId.of("Europe/Berlin");
  }
}
