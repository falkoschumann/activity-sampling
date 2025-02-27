// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.Activity;
import de.muspellheim.activitysampling.api.domain.TimeSummary;
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
            Activity.createTestInstance().withTimestamp(LocalDateTime.parse("2025-02-07T08:30")),
            Activity.createTestInstance().withTimestamp(LocalDateTime.parse("2025-02-07T09:30")));

    var timeSummary = TimeSummary.from(today, activities);

    assertEquals(Duration.ofMinutes(60), timeSummary.hoursToday());
  }

  @Test
  void sumsYesterday() {
    var today = LocalDate.of(2025, 2, 7);
    var activities =
        List.of(
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-02-06T08:30")), // yesterday
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-02-06T09:30"))); // yesterday

    var timeSummary = TimeSummary.from(today, activities);

    assertEquals(Duration.ofMinutes(60), timeSummary.hoursYesterday());
  }

  @Test
  void sumsThisWeek() {
    var friday = LocalDate.of(2025, 1, 31);
    var activities =
        List.of(
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-01-29T09:30")), // wednesday
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-01-27T09:30"))); // monday

    var timeSummary = TimeSummary.from(friday, activities);

    assertEquals(Duration.ofMinutes(60), timeSummary.hoursThisWeek());
  }

  @Test
  void sumsThisMonth() {
    var endOfMonth = LocalDate.of(2025, 1, 31);
    var activities =
        List.of(
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-01-15T09:30")), // mid of month
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-01-02T09:30"))); // start of month

    var timeSummary = TimeSummary.from(endOfMonth, activities);

    assertEquals(Duration.ofMinutes(60), timeSummary.hoursThisMonth());
  }

  @Test
  void sumsComplexExample() {
    var today = LocalDate.of(2025, 1, 23);
    var activities =
        List.of(
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2024-12-31T09:30")), // end of last month
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-01-01T09:30")), // start of this month
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-01-19T09:30")), // end of last week
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-01-20T09:30")), // start of this week
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-01-22T09:30")), // yesterday
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-01-23T09:30")), // today
            Activity.createTestInstance()
                .withTimestamp(LocalDateTime.parse("2025-01-24T09:30"))); // tomorrow

    var timeSummary = TimeSummary.from(today, activities);

    assertEquals(
        TimeSummary.builder()
            .hoursToday(Duration.ofMinutes(30))
            .hoursYesterday(Duration.ofMinutes(30))
            .hoursThisWeek(Duration.ofMinutes(120))
            .hoursThisMonth(Duration.ofMinutes(180))
            .build(),
        timeSummary);
  }
}
