// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.io.Serial;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;

class MemoryActivitiesRepository extends MemoryCrudRepository<ActivityDto, Long>
    implements ActivitiesRepository {

  @Serial private static final long serialVersionUID = 1L;

  static ActivitiesRepository createTestInstance() {
    return new MemoryActivitiesRepository(
        List.of(
            ActivityDto.createTestInstance().withStart(Instant.parse("2024-12-18T08:30:00Z")),
            ActivityDto.createTestInstance().withStart(Instant.parse("2024-12-17T16:00:00Z")),
            ActivityDto.createTestInstance().withStart(Instant.parse("2024-12-17T15:30:00Z")),
            ActivityDto.createTestInstance()
                .withStart(Instant.parse("2024-12-17T15:00:00Z"))
                .withTask("Make things")
                .withNotes("This is a note")));
  }

  MemoryActivitiesRepository() {}

  MemoryActivitiesRepository(List<ActivityDto> activities) {
    super(activities);
  }

  @Override
  public List<ActivityDto> findByStartGreaterThanEqualOrderByStartDesc(Instant start) {
    return stream()
        .filter(e -> !e.getStart().isBefore(start))
        .sorted(Comparator.comparing(ActivityDto::getStart).reversed())
        .toList();
  }

  @Override
  protected Long getEntityId(ActivityDto entity) {
    return entity.getId();
  }

  @Override
  protected void setEntityId(ActivityDto entity, Long id) {
    entity.setId(id);
  }

  @Override
  protected Long nextId() {
    return size() + 1L;
  }

  @Override
  protected <S extends ActivityDto> void verifyConstraints(S entity) {
    stream()
        .filter(e -> e.getStart().equals(entity.getStart()))
        .findFirst()
        .ifPresent(
            e -> {
              throw new DataIntegrityViolationException("Duplicate timestamp");
            });
  }
}
