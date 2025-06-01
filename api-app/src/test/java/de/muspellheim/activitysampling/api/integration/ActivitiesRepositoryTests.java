// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@DataJpaTest(properties = {"spring.flyway.target=1"})
class ActivitiesRepositoryTests {

  @Autowired private ActivitiesRepository repository;

  @Test
  void findsByTimestampGreaterThanEqualOrderByTimestampDesc() {
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

  @Test
  void failsWhenActivitiesTimestampIsDuplicated() {
    repository.save(ActivityDto.createTestInstance());

    assertThrows(
        DataIntegrityViolationException.class,
        () -> repository.save(ActivityDto.createTestInstance()));
  }
}
