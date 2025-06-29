// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.activities.Holiday;
import de.muspellheim.activitysampling.api.infrastructure.CalenderReader;
import de.muspellheim.activitysampling.api.infrastructure.CsvHolidayRepository;
import de.muspellheim.activitysampling.api.infrastructure.CsvHolidayRepositoryConfiguration;
import de.muspellheim.activitysampling.api.infrastructure.Event;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

class CalenderReaderTests {

  @Test
  void readsEvents() {
    var provider = new CalenderReader(Paths.get("src/test/resources/holidays.ics"));

    var events = provider.readEvents();

    var karfreitag =
        Event.builder().dtStart(LocalDate.parse("2025-04-18")).summary("Karfreitag").build();
    var ostermontag =
        Event.builder().dtStart(LocalDate.parse("2025-04-21")).summary("Ostermontag").build();
    assertEquals(List.of(karfreitag, ostermontag), events);
  }

  @Test
  @Disabled
  void importHolidays() {
    var eventsReader = new CalenderReader(Paths.get("data/sachsen.ics"));
    var events = eventsReader.readEvents();

    var holidays =
        events.stream()
            .map(it -> Holiday.builder().date((LocalDate) it.dtStart()).title(it.summary()).build())
            .sorted(Comparator.comparing(Holiday::date))
            .toList();
    var holidayRepository =
        new CsvHolidayRepository(
            CsvHolidayRepositoryConfiguration.builder()
                .file(Paths.get("data/holidays.csv"))
                .build());
    holidayRepository.save(holidays);
  }
}
