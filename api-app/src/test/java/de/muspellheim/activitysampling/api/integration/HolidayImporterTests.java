// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.activities.Holiday;
import de.muspellheim.activitysampling.api.infrastructure.HolidayImporter;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class HolidayImporterTests {

  @Test
  void readsHolidays() {
    var provider = new HolidayImporter(Paths.get("src/test/resources/holidays.ics"));

    var holidays =
        provider.getHolidays(LocalDate.parse("2025-01-01"), LocalDate.parse("2026-01-01"));

    var karfreitag =
        Holiday.builder().date(LocalDate.parse("2025-04-18")).title("Karfreitag").build();
    var ostermontag =
        Holiday.builder().date(LocalDate.parse("2025-04-21")).title("Ostermontag").build();
    assertEquals(List.of(karfreitag, ostermontag), holidays);
  }
}
