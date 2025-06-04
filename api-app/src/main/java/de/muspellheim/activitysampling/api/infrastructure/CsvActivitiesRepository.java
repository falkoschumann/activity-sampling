// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.lang.NonNull;

public class CsvActivitiesRepository extends AbstractActivitiesRepository {
  public static final String TIMESTAMP_COLUMN = "Timestamp";
  public static final String DURATION_COLUMN = "Duration";
  public static final String CLIENT_COLUMN = "Client";
  public static final String PROJECT_COLUMN = "Project";
  public static final String TASK_COLUMN = "Task";
  public static final String NOTES_COLUMN = "Notes";

  private final Path file;

  public CsvActivitiesRepository(Path file) {
    this.file = file;
  }

  @NonNull
  @Override
  @SuppressWarnings("unchecked")
  public <S extends ActivityDto> S save(@NonNull S entity) {
    try (var printer = createPrinter()) {
      var count = count();
      printer.printRecord(
          entity.getTimestamp().truncatedTo(ChronoUnit.SECONDS),
          entity.getDuration(),
          entity.getClient(),
          entity.getProject(),
          entity.getTask(),
          entity.getNotes());
      return (S) entity.withId(count + 1);
    } catch (IOException e) {
      throw new UncheckedIOException("Failed to append activity to file " + file, e);
    }
  }

  @NonNull
  @Override
  public List<ActivityDto> findAll() {
    try (var parser = createParser()) {
      return parser.stream().map(this::parseRecord).toList();
    } catch (NoSuchFileException e) {
      return List.of();
    } catch (IOException e) {
      throw new UncheckedIOException("Error reading CSV file", e);
    }
  }

  @Override
  public void deleteById(Long ids) {}

  private CSVPrinter createPrinter() throws IOException {
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

  private ActivityDto parseRecord(CSVRecord record) {
    var id = record.getRecordNumber();
    var timestamp = record.get(TIMESTAMP_COLUMN);
    var duration = record.get(DURATION_COLUMN);
    var client = record.get(CLIENT_COLUMN);
    var project = record.get(PROJECT_COLUMN);
    var task = record.get(TASK_COLUMN);
    var notes = record.get(NOTES_COLUMN);
    return ActivityDto.builder()
        .id(id)
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
        .setSkipHeaderRecord(Files.exists(file))
        .setNullString("")
        .get();
  }
}
