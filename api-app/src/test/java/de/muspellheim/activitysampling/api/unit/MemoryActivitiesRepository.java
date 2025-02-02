/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.unit;

import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

class MemoryActivitiesRepository extends ArrayList<ActivityDto> implements ActivitiesRepository {

  static MemoryActivitiesRepository createTestInstance() {
    return new MemoryActivitiesRepository(
        List.of(
            new ActivityDto(
                Instant.parse("2024-12-18T08:30:00Z"),
                Duration.parse("PT30M"),
                "ACME Inc.",
                "Foobar",
                "Do something"),
            new ActivityDto(
                Instant.parse("2024-12-17T16:00:00Z"),
                Duration.parse("PT30M"),
                "ACME Inc.",
                "Foobar",
                "Do something"),
            new ActivityDto(
                Instant.parse("2024-12-17T15:30:00Z"),
                Duration.parse("PT30M"),
                "ACME Inc.",
                "Foobar",
                "Do something"),
            new ActivityDto(
                Instant.parse("2024-12-17T15:00:00Z"),
                Duration.parse("PT30M"),
                "ACME Inc.",
                "Foobar",
                "Make things",
                "This is a note")));
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
