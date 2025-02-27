// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.Activity;
import de.muspellheim.activitysampling.api.domain.WorkingDay;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class WorkingDayTests {

  private static final LocalDate TODAY = LocalDate.of(2025, 2, 7);
  private static final Activity TODAY_ACTIVITY_1 =
      Activity.builder().timestamp(LocalDateTime.parse("2025-02-07T09:30")).build();
  private static final Activity TODAY_ACTIVITY_2 =
      Activity.builder().timestamp(LocalDateTime.parse("2025-02-07T10:00")).build();

  private static final LocalDate YESTERDAY = LocalDate.of(2025, 2, 6);
  private static final Activity YESTERDAY_ACTIVITY_3 =
      Activity.builder().timestamp(LocalDateTime.parse("2025-02-06T17:00")).build();
  private static final Activity YESTERDAY_ACTIVITY_2 =
      Activity.builder().timestamp(LocalDateTime.parse("2025-02-06T16:30")).build();
  private static final Activity YESTERDAY_ACTIVITY_1 =
      Activity.builder().timestamp(LocalDateTime.parse("2025-02-06T16:00")).build();

  @Test
  void aggregateEmpty() {
    var workingDays = WorkingDay.from(List.of());

    assertEquals(List.of(), workingDays);
  }

  @Test
  void aggregateOneDay() {
    var workingDays = WorkingDay.from(List.of(TODAY_ACTIVITY_2, TODAY_ACTIVITY_1));

    assertEquals(
        List.of(new WorkingDay(TODAY, List.of(TODAY_ACTIVITY_2, TODAY_ACTIVITY_1))), workingDays);
  }

  @Test
  void aggregateTwoDay() {
    var workingDays =
        WorkingDay.from(
            List.of(
                TODAY_ACTIVITY_2,
                TODAY_ACTIVITY_1,
                YESTERDAY_ACTIVITY_3,
                YESTERDAY_ACTIVITY_2,
                YESTERDAY_ACTIVITY_1));

    assertEquals(
        List.of(
            new WorkingDay(TODAY, List.of(TODAY_ACTIVITY_2, TODAY_ACTIVITY_1)),
            new WorkingDay(
                YESTERDAY,
                List.of(YESTERDAY_ACTIVITY_3, YESTERDAY_ACTIVITY_2, YESTERDAY_ACTIVITY_1))),
        workingDays);
  }
}
