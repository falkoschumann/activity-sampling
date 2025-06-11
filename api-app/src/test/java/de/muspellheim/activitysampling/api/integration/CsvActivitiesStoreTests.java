// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import de.muspellheim.activitysampling.api.infrastructure.CsvActivitiesStore;
import de.muspellheim.activitysampling.api.infrastructure.FileStoreConfiguration;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CsvActivitiesStoreTests {

  private static final Path TEST_FILE = Paths.get("testdata", "activities-store-it.csv");

  @BeforeEach
  void setUp() throws Exception {
    Files.deleteIfExists(TEST_FILE);
  }

  @Test
  void recordsAndReplaysEvents() {
    var configuration = FileStoreConfiguration.builder().file(TEST_FILE).build();
    var store = new CsvActivitiesStore(configuration);

    store.record(
        ActivityLoggedEvent.createTestInstance()
            .withTimestamp(Instant.parse("2023-01-01T11:00:00Z")));
    store.record(
        ActivityLoggedEvent.createTestInstance()
            .withTimestamp(Instant.parse("2023-01-01T12:00:00Z")));
    store.record(
        ActivityLoggedEvent.createTestInstance()
            .withTimestamp(Instant.parse("2023-01-01T13:00:00Z")));
    store.record(
        ActivityLoggedEvent.createTestInstance()
            .withTimestamp(Instant.parse("2023-01-01T14:00:00Z")));

    Instant start = Instant.parse("2023-01-01T12:00:00Z");
    Instant end = Instant.parse("2023-01-01T14:00:00Z");
    var events = store.replay(start, end).toList();

    assertEquals(
        List.of(
            ActivityLoggedEvent.createTestInstance()
                .withTimestamp(Instant.parse("2023-01-01T12:00:00Z")),
            ActivityLoggedEvent.createTestInstance()
                .withTimestamp(Instant.parse("2023-01-01T13:00:00Z"))),
        events);
  }
}
