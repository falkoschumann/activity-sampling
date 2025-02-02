/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.unit;

import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.io.Serial;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

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
}
