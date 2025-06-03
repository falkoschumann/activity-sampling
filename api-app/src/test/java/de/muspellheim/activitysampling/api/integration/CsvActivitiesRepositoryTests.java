// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import de.muspellheim.activitysampling.api.infrastructure.CsvActivitiesRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CsvActivitiesRepositoryTests {

  private static final Path TEST_FILE = Paths.get("testdata", "activities.csv");

  @BeforeEach
  void setUp() throws Exception {
    Files.deleteIfExists(TEST_FILE);
    Files.createDirectories(TEST_FILE.getParent());
  }

  @Test
  void createsEmptyRepository() {
    var repository = new CsvActivitiesRepository(TEST_FILE);

    assertEquals(List.of(), repository.findAll());
  }

  @Test
  void findsByTimestampGreaterThanEqualOrderByTimestampDesc() {
    var repository = new CsvActivitiesRepository(TEST_FILE);
    repository.save(
        ActivityDto.createTestInstance().withTimestamp(Instant.parse("2023-01-01T11:00:00Z")));
    var activity2 =
        repository.save(
            ActivityDto.createTestInstance().withTimestamp(Instant.parse("2023-01-01T12:00:00Z")));
    var activity3 =
        repository.save(
            ActivityDto.createTestInstance().withTimestamp(Instant.parse("2023-01-01T13:00:00Z")));

    var activities =
        repository.findByTimestampGreaterThanEqualOrderByTimestampDesc(
            Instant.parse("2023-01-01T12:00:00Z"));

    assertEquals(List.of(activity3, activity2), activities);
  }
}
