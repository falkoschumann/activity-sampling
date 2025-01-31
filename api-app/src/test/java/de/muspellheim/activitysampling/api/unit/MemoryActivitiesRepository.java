/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.unit;

import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class MemoryActivitiesRepository extends ArrayList<ActivityDto>
    implements ActivitiesRepository {

  public MemoryActivitiesRepository() {
    add(
        new ActivityDto(
            LocalDateTime.parse("2025-01-17T09:30"),
            Duration.parse("PT30M"),
            "ACME Inc.",
            "Foobar",
            "Do something"));
    add(
        new ActivityDto(
            LocalDateTime.parse("2025-01-16T17:00"),
            Duration.parse("PT30M"),
            "ACME Inc.",
            "Foobar",
            "Do something"));
    add(
        new ActivityDto(
            LocalDateTime.parse("2025-01-16T16:30"),
            Duration.parse("PT30M"),
            "ACME Inc.",
            "Foobar",
            "Do something"));
    add(
        new ActivityDto(
            LocalDateTime.parse("2025-01-16T16:00"),
            Duration.parse("PT30M"),
            "ACME Inc.",
            "Foobar",
            "Make things",
            "This is a note"));
  }

  @Override
  public List<ActivityDto> findTimestampGreaterThanOrderByTimestamp(Instant start) {
    return this;
  }

  @Override
  public <S extends ActivityDto> S save(S entity) {
    return null;
  }

  @Override
  public <S extends ActivityDto> Iterable<S> saveAll(Iterable<S> entities) {
    return null;
  }

  @Override
  public Optional<ActivityDto> findById(Instant instant) {
    return Optional.empty();
  }

  @Override
  public boolean existsById(Instant instant) {
    return false;
  }

  @Override
  public Iterable<ActivityDto> findAll() {
    return this;
  }

  @Override
  public Iterable<ActivityDto> findAllById(Iterable<Instant> instants) {
    return null;
  }

  @Override
  public long count() {
    return 0;
  }

  @Override
  public void deleteById(Instant instant) {}

  @Override
  public void delete(ActivityDto entity) {}

  @Override
  public void deleteAllById(Iterable<? extends Instant> instants) {}

  @Override
  public void deleteAll(Iterable<? extends ActivityDto> entities) {}

  @Override
  public void deleteAll() {}
}
