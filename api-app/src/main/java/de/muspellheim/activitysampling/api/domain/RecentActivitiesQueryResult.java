/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.domain;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record RecentActivitiesQueryResult(
    List<WorkingDay> workingDays, TimeSummary timeSummary, Activity lastActivity) {

  public RecentActivitiesQueryResult(List<WorkingDay> workingDays, TimeSummary timeSummary) {
    this(workingDays, timeSummary, null);
  }

  public static RecentActivitiesQueryResult createTestInstance() {
    return new RecentActivitiesQueryResult(
        List.of(
            new WorkingDay(
                LocalDate.parse("2025-01-17"),
                List.of(
                    new Activity(
                        LocalDateTime.parse("2025-01-17T09:30"),
                        Duration.parse("PT30M"),
                        "ACME Inc.",
                        "Foobar",
                        "Do something"))),
            new WorkingDay(
                LocalDate.parse("2025-01-16"),
                List.of(
                    new Activity(
                        LocalDateTime.parse("2025-01-16T17:00"),
                        Duration.parse("PT30M"),
                        "ACME Inc.",
                        "Foobar",
                        "Do something"),
                    new Activity(
                        LocalDateTime.parse("2025-01-16T16:30"),
                        Duration.parse("PT30M"),
                        "ACME Inc.",
                        "Foobar",
                        "Do something"),
                    new Activity(
                        LocalDateTime.parse("2025-01-16T16:00"),
                        Duration.parse("PT30M"),
                        "ACME Inc.",
                        "Foobar",
                        "Make things",
                        "This is a note")))),
        new TimeSummary(
            Duration.parse("PT30M"),
            Duration.parse("PT1H30M"),
            Duration.parse("PT2H"),
            Duration.parse("PT2H")),
        new Activity(
            LocalDateTime.parse("2025-01-17T09:30"),
            Duration.parse("PT30M"),
            "ACME Inc.",
            "Foobar",
            "Do something"));
  }
}
