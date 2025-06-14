// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.activities.Holiday;
import de.muspellheim.activitysampling.api.infrastructure.HolidayCalendar;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class HolidayCalendarTests {

  @Test
  void readsHolidays() {
    var provider = new HolidayCalendar(Paths.get("src/test/resources/holidays.ics"));

    var holidays = provider.getHolidays(LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31));

    var karfreitag = Holiday.builder().date(LocalDate.of(2025, 4, 18)).title("Karfreitag").build();
    var ostermontag =
        Holiday.builder().date(LocalDate.of(2025, 4, 21)).title("Ostermontag").build();
    assertEquals(List.of(karfreitag, ostermontag), holidays);
  }
}
