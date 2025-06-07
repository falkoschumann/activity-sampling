// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import java.io.Closeable;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.StandardOpenOption;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Stream;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

@Component
public class CsvActivitiesStore implements ActivitiesStore {

  public static final String TIMESTAMP_COLUMN = "Timestamp";
  public static final String DURATION_COLUMN = "Duration";
  public static final String CLIENT_COLUMN = "Client";
  public static final String PROJECT_COLUMN = "Project";
  public static final String TASK_COLUMN = "Task";
  public static final String NOTES_COLUMN = "Notes";

  private final FileStoreConfiguration configuration;

  public CsvActivitiesStore(FileStoreConfiguration configuration) {
    this.configuration = configuration;
  }

  @Override
  public void record(ActivityLoggedEvent event) {
    try (var printer = createPrinter()) {
      printer.printRecord(
          event.timestamp().truncatedTo(ChronoUnit.SECONDS),
          event.duration(),
          event.client(),
          event.project(),
          event.task(),
          event.notes());
    } catch (IOException e) {
      throw new UncheckedIOException(
          "Failed to append activity to file " + configuration.file(), e);
    }
  }

  @Override
  public Stream<ActivityLoggedEvent> replay() {
    try {
      var parser = createParser();
      return parser.stream().map(this::parseRecord).onClose(() -> tryClose(parser));
    } catch (NoSuchFileException e) {
      return Stream.empty();
    } catch (IOException e) {
      throw new UncheckedIOException("Error reading CSV file", e);
    }
  }

  private CSVPrinter createPrinter() throws IOException {
    Files.createDirectories(configuration.file().getParent());
    var format = createCsvFormat();
    var writer =
        Files.newBufferedWriter(
            configuration.file(),
            StandardOpenOption.CREATE,
            StandardOpenOption.WRITE,
            StandardOpenOption.APPEND);
    return new CSVPrinter(writer, format);
  }

  private CSVParser createParser() throws IOException {
    var format = createCsvFormat();
    var reader = Files.newBufferedReader(configuration.file());
    return format.parse(reader);
  }

  private ActivityLoggedEvent parseRecord(CSVRecord record) {
    var timestamp = record.get(TIMESTAMP_COLUMN);
    var duration = record.get(DURATION_COLUMN);
    var client = record.get(CLIENT_COLUMN);
    var project = record.get(PROJECT_COLUMN);
    var task = record.get(TASK_COLUMN);
    var notes = record.get(NOTES_COLUMN);
    return ActivityLoggedEvent.builder()
        .timestamp(Instant.parse(timestamp))
        .duration(Duration.parse(duration))
        .client(client)
        .project(project)
        .task(task)
        .notes(notes)
        .build();
  }

  private CSVFormat createCsvFormat() {
    return CSVFormat.RFC4180
        .builder()
        .setHeader(
            TIMESTAMP_COLUMN,
            DURATION_COLUMN,
            CLIENT_COLUMN,
            PROJECT_COLUMN,
            TASK_COLUMN,
            NOTES_COLUMN)
        .setSkipHeaderRecord(Files.exists(configuration.file()))
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
