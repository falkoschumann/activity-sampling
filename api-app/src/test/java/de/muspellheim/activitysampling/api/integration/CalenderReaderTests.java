// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.infrastructure.CalenderReader;
import de.muspellheim.activitysampling.api.infrastructure.Event;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
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
}
