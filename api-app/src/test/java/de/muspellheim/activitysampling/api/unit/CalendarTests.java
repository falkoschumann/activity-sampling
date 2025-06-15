// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.activities.Calendar;
import java.time.LocalDate;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CalendarTests {

  @Test
  void determinesWorkingDays() {
    var calendar = new Calendar();

    var start = LocalDate.parse("2025-06-01");
    var end = LocalDate.parse("2025-07-01");
    var businessDays = calendar.countBusinessDays(start, end);

    assertEquals(21, businessDays);
  }

  @Test
  void determinesWorkingDaysWithHolidays() {
    var calendar = new Calendar();
    // Pfingstmontag
    calendar.initHolidays(Set.of(LocalDate.parse("2025-06-09")));

    var start = LocalDate.parse("2025-06-01");
    var end = LocalDate.parse("2025-07-01");
    var businessDays = calendar.countBusinessDays(start, end);

    assertEquals(20, businessDays);
  }
}
