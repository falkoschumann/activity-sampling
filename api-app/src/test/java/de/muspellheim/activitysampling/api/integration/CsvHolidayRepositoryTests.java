// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.activities.Holiday;
import de.muspellheim.activitysampling.api.infrastructure.CsvHolidayRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CsvHolidayRepositoryTests {

  private static final Path TEST_FILE = Paths.get("testdata", "holiday-calendar-it.csv");

  @BeforeEach
  void setUp() throws Exception {
    Files.deleteIfExists(TEST_FILE);
  }

  @Test
  void findsAllSavedHolidays() {
    var repository = new CsvHolidayRepository(TEST_FILE);
    var karfreitag =
        Holiday.builder().date(LocalDate.parse("2025-04-18")).title("Karfreitag").build();
    var ostermontag =
        Holiday.builder().date(LocalDate.parse("2025-04-21")).title("Ostermontag").build();

    repository.save(List.of(karfreitag, ostermontag));
    var holidays =
        repository.findAllByDate(LocalDate.parse("2025-04-01"), LocalDate.parse("2025-05-01"));

    assertEquals(List.of(karfreitag, ostermontag), holidays);
  }

  @Test
  void findsAllByDateWithLowerLimit() {
    var repository = new CsvHolidayRepository(TEST_FILE);
    var karfreitag =
        Holiday.builder().date(LocalDate.parse("2025-04-18")).title("Karfreitag").build();
    var ostermontag =
        Holiday.builder().date(LocalDate.parse("2025-04-21")).title("Ostermontag").build();

    repository.save(List.of(karfreitag, ostermontag));
    var holidays =
        repository.findAllByDate(LocalDate.parse("2025-04-21"), LocalDate.parse("2025-04-28"));

    assertEquals(List.of(ostermontag), holidays);
  }

  @Test
  void findsAllByDateWithUpperLimit() {
    var repository = new CsvHolidayRepository(TEST_FILE);
    var karfreitag =
        Holiday.builder().date(LocalDate.parse("2025-04-18")).title("Karfreitag").build();
    var ostermontag =
        Holiday.builder().date(LocalDate.parse("2025-04-21")).title("Ostermontag").build();

    repository.save(List.of(karfreitag, ostermontag));
    var holidays =
        repository.findAllByDate(LocalDate.parse("2025-04-14"), LocalDate.parse("2025-04-21"));

    assertEquals(List.of(karfreitag), holidays);
  }
}
