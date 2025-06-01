// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import de.muspellheim.activitysampling.api.infrastructure.MemoryActivitiesRepository;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

@SuppressWarnings("checkstyle:VariableDeclarationUsageDistance")
class MemoryActivitiesRepositoryTests {

  @Test
  void createsEmptyRepository() {
    var repository = new MemoryActivitiesRepository();

    assertEquals(List.of(), repository.findAll());
  }

  @Test
  void findsByTimestampGreaterThanEqualOrderByTimestampDesc() {
    var repository = new MemoryActivitiesRepository();
    repository.save(
        ActivityDto.createTestInstance().withTimestamp(Instant.parse("2023-01-01T10:00:00Z")));
    var activity2 =
        repository.save(
            ActivityDto.createTestInstance().withTimestamp(Instant.parse("2023-01-01T11:00:00Z")));
    var activity3 =
        repository.save(
            ActivityDto.createTestInstance().withTimestamp(Instant.parse("2023-01-01T12:00:00Z")));

    var activities =
        repository.findByTimestampGreaterThanEqualOrderByTimestampDesc(
            Instant.parse("2023-01-01T11:00:00Z"));

    assertEquals(List.of(activity3, activity2), activities);
  }

  @Test
  void addsNewActivity() {
    var repository = new MemoryActivitiesRepository();

    var activity = ActivityDto.createTestInstance();
    repository.save(activity);

    assertEquals(List.of(activity.withId(1L)), repository.findAll());
  }

  @Test
  void addsActivityWithGivenId() {
    var repository = new MemoryActivitiesRepository();
    var activity1 = ActivityDto.createTestInstance();
    repository.save(activity1);

    var activity3 = ActivityDto.createTestInstance().withId(3L);
    repository.save(activity3);

    assertEquals(List.of(activity1.withId(1L), activity3), repository.findAll());
  }

  @Test
  void updatesExistingActivity() {
    var repository = new MemoryActivitiesRepository();
    var activity = ActivityDto.createTestInstance();
    activity = repository.save(activity);

    activity = repository.save(activity.withNotes("notes-1"));

    assertEquals(List.of(activity.withId(1L).withNotes("notes-1")), repository.findAll());
  }

  @Test
  void savesAllActivities() {
    var repository = new MemoryActivitiesRepository();

    var activity1 = ActivityDto.createTestInstance();
    var activity2 = ActivityDto.createTestInstance();
    repository.saveAll(List.of(activity1, activity2));

    assertEquals(List.of(activity1.withId(1L), activity2.withId(2L)), repository.findAll());
  }

  @Test
  void findsActivityById() {
    var repository = new MemoryActivitiesRepository();
    var activity = ActivityDto.createTestInstance();
    activity = repository.save(activity);

    var foundActivity = repository.findById(activity.getId());

    assertEquals(activity, foundActivity.orElseThrow());
  }

  @Test
  void findsActivityByIdNotFound() {
    var repository = new MemoryActivitiesRepository();

    var foundActivity = repository.findById(1L);

    assertTrue(foundActivity.isEmpty());
  }

  @Test
  void existsActivityById() {
    var repository = new MemoryActivitiesRepository();
    var activity = ActivityDto.createTestInstance();
    activity = repository.save(activity);

    var exists = repository.existsById(activity.getId());

    assertTrue(exists);
  }

  @Test
  void findsAllActivities() {
    var repository = new MemoryActivitiesRepository();
    var activity1 = repository.save(ActivityDto.createTestInstance());
    var activity2 = repository.save(ActivityDto.createTestInstance());

    var activities = repository.findAll();

    assertEquals(List.of(activity1.withId(1L), activity2.withId(2L)), activities);
  }

  @Test
  void findsAllActivitiesById() {
    var repository = new MemoryActivitiesRepository();
    repository.save(ActivityDto.createTestInstance());
    var activity2 = repository.save(ActivityDto.createTestInstance());
    var activity3 = repository.save(ActivityDto.createTestInstance());

    var activities = repository.findAllById(List.of(activity2.getId(), activity3.getId()));

    assertEquals(List.of(activity2, activity3), activities);
  }

  @Test
  void countsActivities() {
    var repository = new MemoryActivitiesRepository();
    repository.save(ActivityDto.createTestInstance());
    repository.save(ActivityDto.createTestInstance());

    var count = repository.count();

    assertEquals(2, count);
  }

  @Test
  void deletesActivityById() {
    var repository = new MemoryActivitiesRepository();
    var activity = repository.save(ActivityDto.createTestInstance());

    repository.deleteById(activity.getId());

    assertFalse(repository.existsById(activity.getId()));
  }

  @Test
  void deletesActivityByInstance() {
    var repository = new MemoryActivitiesRepository();
    var activity = repository.save(ActivityDto.createTestInstance());

    repository.delete(activity);

    assertFalse(repository.existsById(activity.getId()));
  }

  @Test
  void deletesAllActivitiesById() {
    var repository = new MemoryActivitiesRepository();
    var activity1 = repository.save(ActivityDto.createTestInstance());
    var activity2 = repository.save(ActivityDto.createTestInstance());
    var activity3 = repository.save(ActivityDto.createTestInstance());

    repository.deleteAllById(List.of(activity1.getId(), activity2.getId()));

    assertFalse(repository.existsById(activity1.getId()));
    assertFalse(repository.existsById(activity2.getId()));
    assertTrue(repository.existsById(activity3.getId()));
  }

  @Test
  void deletesAllActivitiesByInstance() {
    var repository = new MemoryActivitiesRepository();
    var activity1 = repository.save(ActivityDto.createTestInstance());
    var activity2 = repository.save(ActivityDto.createTestInstance());
    var activity3 = repository.save(ActivityDto.createTestInstance());

    repository.deleteAll(List.of(activity2, activity3));

    assertTrue(repository.existsById(activity1.getId()));
    assertFalse(repository.existsById(activity2.getId()));
    assertFalse(repository.existsById(activity3.getId()));
  }

  @Test
  void deletesAllActivities() {
    var repository = new MemoryActivitiesRepository();
    repository.save(ActivityDto.createTestInstance());
    repository.save(ActivityDto.createTestInstance());
    repository.save(ActivityDto.createTestInstance());

    repository.deleteAll();

    assertEquals(List.of(), repository.findAll());
  }
}
