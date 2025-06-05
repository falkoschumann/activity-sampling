// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import de.muspellheim.activitysampling.api.infrastructure.CsvActivitiesStore;
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
    Files.createDirectories(TEST_FILE.getParent());
  }

  @Test
  void recordsAndReplaysEvents() {
    var store = new CsvActivitiesStore(TEST_FILE);

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

    Instant from = Instant.parse("2023-01-01T12:00:00Z");
    Instant to = Instant.parse("2023-01-01T14:00:00Z");
    var events = store.replay(from, to).toList();

    assertEquals(
        List.of(
            ActivityLoggedEvent.createTestInstance()
                .withTimestamp(Instant.parse("2023-01-01T12:00:00Z")),
            ActivityLoggedEvent.createTestInstance()
                .withTimestamp(Instant.parse("2023-01-01T13:00:00Z"))),
        events);
  }
}
