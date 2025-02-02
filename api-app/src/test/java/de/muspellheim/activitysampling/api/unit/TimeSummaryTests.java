/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.Activity;
import de.muspellheim.activitysampling.api.domain.TimeSummary;
import java.time.Duration;
import java.time.LocalDate;
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
    var today = LocalDate.now();
    var activities =
        List.of(
            Activity.builder().timestamp(today.atTime(8, 30)).build(),
            Activity.builder().timestamp(today.atTime(9, 30)).build());

    var timeSummary = TimeSummary.from(today, activities);

    assertEquals(Duration.ofMinutes(60), timeSummary.hoursToday());
  }

  @Test
  void sumsYesterday() {
    var today = LocalDate.now();
    var yesterday = today.minusDays(1);
    var activities =
        List.of(
            Activity.builder().timestamp(yesterday.atTime(8, 30)).build(),
            Activity.builder().timestamp(yesterday.atTime(9, 30)).build());

    var timeSummary = TimeSummary.from(today, activities);

    assertEquals(Duration.ofMinutes(60), timeSummary.hoursYesterday());
  }

  @Test
  void sumsThisWeek() {
    var monday = LocalDate.of(2025, 1, 27);
    var wednesday = LocalDate.of(2025, 1, 29);
    var friday = LocalDate.of(2025, 1, 31);
    var activities =
        List.of(
            Activity.builder().timestamp(wednesday.atTime(9, 30)).build(),
            Activity.builder().timestamp(monday.atTime(9, 30)).build());

    var timeSummary = TimeSummary.from(friday, activities);

    assertEquals(Duration.ofMinutes(60), timeSummary.hoursThisWeek());
  }

  @Test
  void sumsThisMonth() {
    var start = LocalDate.of(2025, 1, 2);
    var mid = LocalDate.of(2025, 1, 15);
    var end = LocalDate.of(2025, 1, 31);
    var activities =
        List.of(
            Activity.builder().timestamp(mid.atTime(9, 30)).build(),
            Activity.builder().timestamp(start.atTime(9, 30)).build());

    var timeSummary = TimeSummary.from(end, activities);

    assertEquals(Duration.ofMinutes(60), timeSummary.hoursThisMonth());
  }

  @Test
  void sumsComplexExample() {
    var endOfLastMonth = LocalDate.of(2024, 12, 31);
    var startOfThisMonth = LocalDate.of(2025, 1, 1);
    var endOfLastWeek = LocalDate.of(2025, 1, 19);
    var startOfThisWeek = LocalDate.of(2025, 1, 20);
    var yesterday = LocalDate.of(2025, 1, 22);
    var today = LocalDate.of(2025, 1, 23);
    var tomorrow = LocalDate.of(2025, 1, 24);
    var activities =
        List.of(
            Activity.builder().timestamp(endOfLastMonth.atTime(9, 30)).build(),
            Activity.builder().timestamp(startOfThisMonth.atTime(9, 30)).build(),
            Activity.builder().timestamp(endOfLastWeek.atTime(9, 30)).build(),
            Activity.builder().timestamp(startOfThisWeek.atTime(9, 30)).build(),
            Activity.builder().timestamp(yesterday.atTime(9, 30)).build(),
            Activity.builder().timestamp(today.atTime(9, 30)).build(),
            Activity.builder().timestamp(tomorrow.atTime(9, 30)).build());

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
