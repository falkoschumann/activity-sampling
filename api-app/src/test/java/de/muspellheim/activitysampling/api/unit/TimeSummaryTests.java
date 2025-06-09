// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.TimeSummary;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class TimeSummaryTests {

  @Test
  void sumsEmpty() {
    var timeSummary = TimeSummary.from(LocalDate.now(), List.of());

    assertEquals(TimeSummary.NULL, timeSummary);
  }

  @Test
  void sumsToday() {
    var today = LocalDate.of(2025, 2, 7);
    var activities =
        List.of(
            createActivity("2025-02-07T08:30"), // today
            createActivity("2025-02-07T09:30") // today
            );

    var timeSummary = TimeSummary.from(today, activities);

    assertEquals(Duration.ofMinutes(60), timeSummary.hoursToday());
  }

  @Test
  void sumsYesterday() {
    var today = LocalDate.of(2025, 2, 7);
    var activities =
        List.of(
            createActivity("2025-02-06T08:30"), // yesterday
            createActivity("2025-02-06T09:30")); // yesterday

    var timeSummary = TimeSummary.from(today, activities);

    assertEquals(Duration.ofMinutes(60), timeSummary.hoursYesterday());
  }

  @Test
  void sumsThisWeek() {
    var friday = LocalDate.parse("2025-06-06");
    var activities =
        List.of(
            createActivity("2025-06-02T09:30"), // monday
            createActivity("2025-06-04T09:30"), // wednesday
            createActivity("2025-06-08T09:30") // sunday
            );

    var timeSummary = TimeSummary.from(friday, activities);

    assertEquals(Duration.ofMinutes(90), timeSummary.hoursThisWeek());
  }

  @Test
  void sumsThisMonth() {
    var today = LocalDate.of(2025, 1, 15);
    var activities =
        List.of(
            createActivity("2025-01-01T09:30"), // start of the month
            createActivity("2025-01-15T09:30"), // today
            createActivity("2025-01-31T09:30") // end of month
            );

    var timeSummary = TimeSummary.from(today, activities);

    assertEquals(Duration.ofMinutes(90), timeSummary.hoursThisMonth());
  }

  @Test
  void sumsComplexExample() {
    var today = LocalDate.of(2025, 1, 23);
    var activities =
        List.of(
            createActivity("2024-12-31T09:30"), // end of last month, not included
            createActivity("2025-01-01T09:30"), // start of this month
            createActivity("2025-01-19T09:30"), // end of last week
            createActivity("2025-01-20T09:30"), // start of this week
            createActivity("2025-01-22T09:30"), // yesterday
            createActivity("2025-01-23T09:30"), // today
            createActivity("2025-01-24T09:30"), // tomorrow
            createActivity("2025-01-26T09:30"), // end of this week, included in week and month
            createActivity("2025-01-31T09:30"), // end of this month, included month
            createActivity("2025-02-01T09:30") // start of next month, not included
            );

    var timeSummary = TimeSummary.from(today, activities);

    assertEquals(
        TimeSummary.builder()
            .hoursToday(Duration.ofMinutes(30))
            .hoursYesterday(Duration.ofMinutes(30))
            .hoursThisWeek(Duration.ofMinutes(5 * 30))
            .hoursThisMonth(Duration.ofMinutes(8 * 30))
            .build(),
        timeSummary);
  }

  private Activity createActivity(String timestamp) {
    return Activity.createTestInstance().withTimestamp(LocalDateTime.parse(timestamp));
  }
}
