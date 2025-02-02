/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.application.ActivitiesService;
import de.muspellheim.activitysampling.api.domain.Activity;
import de.muspellheim.activitysampling.api.domain.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.TimeSummary;
import de.muspellheim.activitysampling.api.domain.WorkingDay;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.Test;

class ActivitiesServiceTests {

  @Test
  void queriesRecentActivities() {
    var repository = MemoryActivitiesRepository.createTestInstance();
    var service = new ActivitiesService(repository);

    var result = service.getRecentActivities(RecentActivitiesQuery.createTestInstance());

    assertEquals(RecentActivitiesQueryResult.createTestInstance(), result);
  }

  @Test
  void queriesRecentActivitiesWithoutQuery() {
    var nowTimestamp = Instant.now();
    var now = nowTimestamp.atZone(ZoneId.systemDefault()).toLocalDateTime();
    var repository = new MemoryActivitiesRepository();
    repository.add(
        new ActivityDto(nowTimestamp, Duration.ofMinutes(20), "client-1", "project-1", "task-1"));
    var service = new ActivitiesService(repository);

    var result = service.getRecentActivities(RecentActivitiesQuery.NULL);

    assertEquals(
        new RecentActivitiesQueryResult(
            List.of(
                new WorkingDay(
                    now.toLocalDate(),
                    List.of(
                        new Activity(
                            now, Duration.ofMinutes(20), "client-1", "project-1", "task-1")))),
            new TimeSummary(
                Duration.ofMinutes(20),
                Duration.ZERO,
                Duration.ofMinutes(20),
                Duration.ofMinutes(20)),
            new Activity(now, Duration.ofMinutes(20), "client-1", "project-1", "task-1")),
        result);
  }
}
