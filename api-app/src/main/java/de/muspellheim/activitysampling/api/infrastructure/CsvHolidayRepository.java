// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import de.muspellheim.activitysampling.api.domain.activities.Holiday;
import java.io.Closeable;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;

public class CsvHolidayRepository implements HolidayRepository {

  public static final String DATE_COLUMN = "Date";
  public static final String TITLE_COLUMN = "Title";

  private final Path file;

  public CsvHolidayRepository(Path file) {
    this.file = file;
  }

  @Override
  public List<Holiday> findAllByDate(LocalDate startInclusive, LocalDate endExclusive) {
    try {
      var parser = createParser();
      return parser.stream()
          .map(this::parseRecord)
          .filter(it -> !it.date().isBefore(startInclusive))
          .filter(it -> it.date().isBefore(endExclusive))
          .onClose(() -> tryClose(parser))
          .toList();
    } catch (NoSuchFileException e) {
      return List.of();
    } catch (IOException e) {
      throw new UncheckedIOException("Failed reading holidays from file", e);
    }
  }

  @Override
  public void save(Collection<Holiday> holidays) {
    try (var printer = createPrinter()) {
      for (var holiday : holidays) {
        printer.printRecord(holiday.date(), holiday.title());
      }
    } catch (IOException e) {
      throw new UncheckedIOException("Failed writing holidays to file " + file, e);
    }
  }

  private CSVPrinter createPrinter() throws IOException {
    Files.createDirectories(file.getParent());
    var format = createCsvFormat();
    var writer =
        Files.newBufferedWriter(
            file, StandardOpenOption.CREATE, StandardOpenOption.WRITE, StandardOpenOption.APPEND);
    return new CSVPrinter(writer, format);
  }

  private CSVParser createParser() throws IOException {
    var format = createCsvFormat();
    var reader = Files.newBufferedReader(file);
    return format.parse(reader);
  }

  private Holiday parseRecord(CSVRecord record) {
    var date = record.get(DATE_COLUMN);
    var title = record.get(TITLE_COLUMN);
    return Holiday.builder().date(LocalDate.parse(date)).title(title).build();
  }

  private CSVFormat createCsvFormat() {
    return CSVFormat.RFC4180
        .builder()
        .setHeader(DATE_COLUMN, TITLE_COLUMN)
        .setSkipHeaderRecord(Files.exists(file))
        .setNullString("")
        .get();
  }

  private void tryClose(Closeable closeable) {
    try {
      closeable.close();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
