/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.Activity;
import de.muspellheim.activitysampling.api.domain.WorkingDay;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class WorkingDayTests {

  @Test
  void aggregateEmpty() {
    var workingDays = WorkingDay.from(List.of());

    assertEquals(List.of(), workingDays);
  }

  @Test
  void aggregateOneDay() {
    LocalDate today = LocalDate.now();

    var workingDays =
        WorkingDay.from(
            List.of(
                Activity.builder().timestamp(today.atTime(10, 0)).build(),
                Activity.builder().timestamp(today.atTime(9, 30)).build()));

    assertEquals(
        List.of(
            new WorkingDay(
                today,
                List.of(
                    Activity.builder().timestamp(today.atTime(10, 0)).build(),
                    Activity.builder().timestamp(today.atTime(9, 30)).build()))),
        workingDays);
  }

  @Test
  void aggregateTwoDay() {
    LocalDate today = LocalDate.now();
    LocalDate yesterday = today.minusDays(1);

    var workingDays =
        WorkingDay.from(
            List.of(
                Activity.builder().timestamp(today.atTime(10, 0)).build(),
                Activity.builder().timestamp(today.atTime(9, 30)).build(),
                Activity.builder().timestamp(yesterday.atTime(17, 0)).build(),
                Activity.builder().timestamp(yesterday.atTime(16, 30)).build(),
                Activity.builder().timestamp(yesterday.atTime(16, 0)).build()));

    assertEquals(
        List.of(
            new WorkingDay(
                today,
                List.of(
                    Activity.builder().timestamp(today.atTime(10, 0)).build(),
                    Activity.builder().timestamp(today.atTime(9, 30)).build())),
            new WorkingDay(
                yesterday,
                List.of(
                    Activity.builder().timestamp(yesterday.atTime(17, 0)).build(),
                    Activity.builder().timestamp(yesterday.atTime(16, 30)).build(),
                    Activity.builder().timestamp(yesterday.atTime(16, 0)).build()))),
        workingDays);
  }
}
