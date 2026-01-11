// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import de.muspellheim.activitysampling.api.domain.activities.Holiday;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import net.fortuna.ical4j.data.CalendarBuilder;
import net.fortuna.ical4j.data.ParserException;
import net.fortuna.ical4j.model.component.CalendarComponent;
import net.fortuna.ical4j.model.component.VEvent;

public class CalenderReader {

  public static void main(String[] args) {
    // https://ics.tools
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

  private final Path file;

  public CalenderReader(Path file) {
    this.file = file;
  }

  public List<Event> readEvents() {
    try {
      var in = Files.newInputStream(file);
      var builder = new CalendarBuilder();
      var calendar = builder.build(in);
      return calendar.getComponents().stream().map(this::map).toList();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    } catch (ParserException e) {
      throw new RuntimeException("Failed to parse the calendar file", e);
    }
  }

  private Event map(CalendarComponent component) {
    if (component instanceof VEvent e) {
      var dtStart = e.getDateTimeStart().getDate();
      var summary = e.getSummary().getValue();
      return Event.builder().dtStart(dtStart).summary(summary).build();
    }

    throw new IllegalStateException("Unsupported calendar component: " + component.getName());
  }
}
