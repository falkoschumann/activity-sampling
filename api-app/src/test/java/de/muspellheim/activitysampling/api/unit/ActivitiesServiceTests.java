/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.application.ActivitiesService;
import de.muspellheim.activitysampling.api.application.CommandStatus;
import de.muspellheim.activitysampling.api.application.LogActivityCommand;
import de.muspellheim.activitysampling.api.application.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.application.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.Activity;
import de.muspellheim.activitysampling.api.domain.TimeSummary;
import de.muspellheim.activitysampling.api.domain.WorkingDay;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class ActivitiesServiceTests {

  @Nested
  class LogActivity {

    @Test
    void logsActivityWithoutNotes() {
      var repository = new MemoryActivitiesRepository();
      var service = new ActivitiesService(repository);

      var result = service.logActivity(LogActivityCommand.builder().build());

      assertEquals(CommandStatus.createSuccess(), result);
      assertEquals(List.of(ActivityDto.builder().build()), repository);
    }

    @Test
    void logsActivityWithNotes() {
      var repository = new MemoryActivitiesRepository();
      var service = new ActivitiesService(repository);

      var result =
          service.logActivity(LogActivityCommand.builder().notes("This is a note").build());

      assertEquals(CommandStatus.createSuccess(), result);
      assertEquals(List.of(ActivityDto.builder().notes("This is a note").build()), repository);
    }

    @Test
    void failsWhenActivitiesTimestampIsDuplicated() {
      var repository = new MemoryActivitiesRepository();
      repository.add(ActivityDto.builder().build());
      var service = new ActivitiesService(repository);

      var result = service.logActivity(LogActivityCommand.builder().build());

      assertEquals(CommandStatus.createFailure("Activity already exists."), result);
    }
  }

  @Nested
  class RecentActivities {

    @Test
    void returnsRecentActivities() {
      var repository = MemoryActivitiesRepository.createTestInstance();
      var service = new ActivitiesService(repository);

      var result = service.getRecentActivities(RecentActivitiesQuery.builder().build());

      assertEquals(RecentActivitiesQueryResult.builder().build(), result);
    }

    @Test
    void returnsNoRecentActivitiesWithoutActivities() {
      var repository = new MemoryActivitiesRepository();
      var service = new ActivitiesService(repository);

      var result = service.getRecentActivities(RecentActivitiesQuery.builder().build());

      assertEquals(RecentActivitiesQueryResult.NULL, result);
    }

    @Test
    void returnsRecentActivitiesForTodayWhenQueryIsNotGiven() {
      var nowTimestamp = Instant.now();
      var now = nowTimestamp.atZone(ZoneId.systemDefault()).toLocalDateTime();
      var repository = new MemoryActivitiesRepository();
      repository.add(
          new ActivityDto(nowTimestamp, Duration.ofMinutes(20), "client-1", "project-1", "task-1"));
      var service = new ActivitiesService(repository);

      var result = service.getRecentActivities(RecentActivitiesQuery.NULL);

      assertEquals(
          new RecentActivitiesQueryResult(
              Activity.builder()
                  .timestamp(nowTimestamp)
                  .duration(Duration.ofMinutes(20))
                  .client("client-1")
                  .project("project-1")
                  .task("task-1")
                  .build(),
              List.of(
                  new WorkingDay(
                      now.toLocalDate(),
                      List.of(
                          Activity.builder()
                              .timestamp(nowTimestamp)
                              .duration(Duration.ofMinutes(20))
                              .client("client-1")
                              .project("project-1")
                              .task("task-1")
                              .build()))),
              new TimeSummary(
                  Duration.ofMinutes(20),
                  Duration.ZERO,
                  Duration.ofMinutes(20),
                  Duration.ofMinutes(20))),
          result);
    }
  }
}
