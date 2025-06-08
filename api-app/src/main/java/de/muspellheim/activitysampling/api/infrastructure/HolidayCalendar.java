// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import net.fortuna.ical4j.data.CalendarBuilder;
import net.fortuna.ical4j.data.ParserException;
import net.fortuna.ical4j.model.component.CalendarComponent;

public class HolidayCalendar {

  private final Path file;

  public HolidayCalendar(Path file) {
    this.file = file;
  }

  public List<Holiday> getHolidays(LocalDate from, LocalDate to) {
    try {
      var fin = Files.newInputStream(file);
      var builder = new CalendarBuilder();
      var calendar = builder.build(fin);
      return calendar.getComponents().stream()
          .map(this::map)
          .filter(it -> !it.date().isBefore(from))
          .filter(it -> !it.date().isAfter(to))
          .sorted(Comparator.comparing(Holiday::date))
          .toList();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    } catch (ParserException e) {
      throw new RuntimeException("Failed to parse the calendar file", e);
    }
  }

  private Holiday map(CalendarComponent component) {
    var date =
        LocalDate.parse(
            component.getProperty("dtstart").get().getValue(),
            DateTimeFormatter.ofPattern("yyyyMMdd"));
    var name = component.getProperty("summary").get().getValue();
    return new Holiday(date, name);
  }
}
