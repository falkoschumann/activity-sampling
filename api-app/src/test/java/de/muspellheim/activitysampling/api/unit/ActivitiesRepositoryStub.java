// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import de.muspellheim.activitysampling.api.util.MemoryCrudRepository;
import java.io.Serial;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import org.springframework.dao.DuplicateKeyException;

class ActivitiesRepositoryStub extends MemoryCrudRepository<ActivityDto, Instant>
    implements ActivitiesRepository {

  @Serial private static final long serialVersionUID = 1L;

  static ActivitiesRepository createTestInstance() {
    return new ActivitiesRepositoryStub(
        List.of(
            ActivityDto.createTestInstance().withTimestamp(Instant.parse("2024-12-18T08:30:00Z")),
            ActivityDto.createTestInstance().withTimestamp(Instant.parse("2024-12-17T16:00:00Z")),
            ActivityDto.createTestInstance().withTimestamp(Instant.parse("2024-12-17T15:30:00Z")),
            ActivityDto.createTestInstance()
                .withTimestamp(Instant.parse("2024-12-17T15:00:00Z"))
                .withTask("Make things")
                .withNotes("This is a note")));
  }

  ActivitiesRepositoryStub() {}

  ActivitiesRepositoryStub(List<ActivityDto> activities) {
    super(activities);
  }

  @Override
  public List<ActivityDto> findByTimestampGreaterThanEqualOrderByTimestampDesc(Instant start) {
    return stream()
        .filter(e -> !e.getTimestamp().isBefore(start))
        .sorted(Comparator.comparing(ActivityDto::getTimestamp).reversed())
        .toList();
  }

  @Override
  protected Instant getEntityId(ActivityDto entity) {
    return entity.getTimestamp();
  }

  @Override
  protected void setEntityId(ActivityDto entity, Instant id) {
    entity.setTimestamp(id);
  }

  @Override
  protected Instant nextId() {
    return Instant.now();
  }

  @Override
  protected <S extends ActivityDto> void verifyConstraints(S entity) {
    stream()
        .filter(e -> e.getTimestamp().equals(entity.getTimestamp()))
        .findFirst()
        .ifPresent(
            e -> {
              throw new DuplicateKeyException("Duplicate timestamp");
            });
  }
}
