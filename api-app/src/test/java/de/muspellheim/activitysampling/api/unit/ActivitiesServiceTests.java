// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

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

  private static final ZoneId TIME_ZONE = ZoneId.of("Europe/Berlin");

  @Nested
  class LogActivity {

    @Test
    void logsActivityWithoutNotes() {
      var repository = new ActivitiesRepositoryStub();
      var service = new ActivitiesService(repository);

      var result = service.logActivity(LogActivityCommand.createTestInstance());

      assertEquals(CommandStatus.createSuccess(), result);
      assertEquals(List.of(ActivityDto.createTestInstance().withId(1L)), repository);
    }

    @Test
    void logsActivityWithNotes() {
      var repository = new ActivitiesRepositoryStub();
      var service = new ActivitiesService(repository);

      var result =
          service.logActivity(LogActivityCommand.createTestInstance().withNotes("This is a note"));

      assertEquals(CommandStatus.createSuccess(), result);
      assertEquals(
          List.of(ActivityDto.createTestInstance().withId(1L).withNotes("This is a note")),
          repository);
    }

    @Test
    void failsWhenActivitiesTimestampIsDuplicated() {
      var repository = new ActivitiesRepositoryStub();
      repository.add(ActivityDto.createTestInstance());
      var service = new ActivitiesService(repository);

      var result = service.logActivity(LogActivityCommand.createTestInstance());

      assertEquals(
          CommandStatus.createFailure(
              "Activity not logged because another one already exists with timestamp 2024-12-18T08:30:00Z."),
          result);
    }
  }

  @Nested
  class RecentActivities {

    @Test
    void returnsRecentActivities() {
      var repository = ActivitiesRepositoryStub.createTestInstance();
      var service = new ActivitiesService(repository);

      var result = service.getRecentActivities(RecentActivitiesQuery.createTestInstance());

      assertEquals(RecentActivitiesQueryResult.createTestInstance(), result);
    }

    @Test
    void returnsNoRecentActivitiesWithoutActivities() {
      var repository = new ActivitiesRepositoryStub();
      var service = new ActivitiesService(repository);

      var result = service.getRecentActivities(RecentActivitiesQuery.createTestInstance());

      assertEquals(RecentActivitiesQueryResult.NULL, result);
    }

    @Test
    void returnsRecentActivitiesForTodayWhenQueryIsNotGiven() {
      var nowTimestamp = Instant.now();
      var now = nowTimestamp.atZone(TIME_ZONE).toLocalDateTime();
      var repository = new ActivitiesRepositoryStub();
      repository.add(
          new ActivityDto(nowTimestamp, Duration.ofMinutes(20), "client-1", "project-1", "task-1"));
      var service = new ActivitiesService(repository);

      var result = service.getRecentActivities(RecentActivitiesQuery.NULL);

      assertEquals(
          new RecentActivitiesQueryResult(
              Activity.createTestInstance()
                  .withStart(now)
                  .withDuration(Duration.ofMinutes(20))
                  .withClient("client-1")
                  .withProject("project-1")
                  .withTask("task-1"),
              List.of(
                  new WorkingDay(
                      now.toLocalDate(),
                      List.of(
                          Activity.createTestInstance()
                              .withStart(now)
                              .withDuration(Duration.ofMinutes(20))
                              .withClient("client-1")
                              .withProject("project-1")
                              .withTask("task-1")))),
              new TimeSummary(
                  Duration.ofMinutes(20),
                  Duration.ZERO,
                  Duration.ofMinutes(20),
                  Duration.ofMinutes(20)),
              TIME_ZONE),
          result);
    }
  }
}
