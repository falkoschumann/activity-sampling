/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.unit;

import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.io.Serial;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.springframework.dao.DuplicateKeyException;

class MemoryActivitiesRepository extends ArrayList<ActivityDto> implements ActivitiesRepository {

  @Serial private static final long serialVersionUID = 1L;

  static ActivitiesRepository createTestInstance() {
    return new MemoryActivitiesRepository(
        List.of(
            ActivityDto.builder().timestamp(Instant.parse("2024-12-18T08:30:00Z")).build(),
            ActivityDto.builder().timestamp(Instant.parse("2024-12-17T16:00:00Z")).build(),
            ActivityDto.builder().timestamp(Instant.parse("2024-12-17T15:30:00Z")).build(),
            ActivityDto.builder()
                .timestamp(Instant.parse("2024-12-17T15:00:00Z"))
                .task("Make things")
                .notes("This is a note")
                .build()));
  }

  MemoryActivitiesRepository() {}

  MemoryActivitiesRepository(List<ActivityDto> activities) {
    super(activities);
  }

  @Override
  public List<ActivityDto> findByTimestampGreaterThanOrderByTimestampDesc(Instant start) {
    return this;
  }

  @Override
  public <S extends ActivityDto> S save(S entity) {
    if (existsById(entity.getTimestamp())) {
      throw new DuplicateKeyException("Activity already exists.");
    }
    add(entity);
    return entity;
  }

  @Override
  public <S extends ActivityDto> Iterable<S> saveAll(Iterable<S> entities) {
    entities.forEach(this::save);
    return entities;
  }

  @Override
  public Optional<ActivityDto> findById(Instant instant) {
    return stream().filter(a -> a.getTimestamp().equals(instant)).findFirst();
  }

  @Override
  public boolean existsById(Instant instant) {
    return findById(instant).isPresent();
  }

  @Override
  public Iterable<ActivityDto> findAll() {
    return this;
  }

  @Override
  public Iterable<ActivityDto> findAllById(Iterable<Instant> instants) {
    var list = StreamSupport.stream(instants.spliterator(), false).toList();
    return stream().filter(a -> list.contains(a.getTimestamp())).toList();
  }

  @Override
  public long count() {
    return this.size();
  }

  @Override
  public void deleteById(Instant instant) {
    findById(instant).ifPresent(this::delete);
  }

  @Override
  public void delete(ActivityDto entity) {
    remove(entity);
  }

  @Override
  public void deleteAllById(Iterable<? extends Instant> instants) {
    instants.forEach(this::deleteById);
  }

  @Override
  public void deleteAll(Iterable<? extends ActivityDto> entities) {
    entities.forEach(this::delete);
  }

  @Override
  public void deleteAll() {
    clear();
  }
}
