// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import de.muspellheim.activitysampling.api.application.ActivitiesService;
import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.TimeSummary;
import de.muspellheim.activitysampling.api.domain.activities.WorkingDay;
import de.muspellheim.activitysampling.api.domain.common.CommandStatus;
import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@DataJpaTest(properties = {"spring.flyway.target=1"})
class ActivitiesServiceTests {

  // TODO Align with user stories

  private static final ZoneId TIME_ZONE = ZoneId.of("Europe/Berlin");

  @Autowired private ActivitiesRepository repository;

  @Nested
  class LogActivity {

    @Test
    void logsActivityWithoutNotes() {
      var service = new ActivitiesService(repository);

      var result = service.logActivity(LogActivityCommand.createTestInstance());

      assertTrue(result.success());
      var activity = repository.findAll().get(0);
      assertEquals(
          List.of(ActivityDto.createTestInstance().withId(activity.getId())), repository.findAll());
    }

    @Test
    void logsActivityWithNotes() {
      var service = new ActivitiesService(repository);

      var result =
          service.logActivity(LogActivityCommand.createTestInstance().withNotes("This is a note"));

      assertTrue(result.success());
      var activity = repository.findAll().get(0);
      assertEquals(
          List.of(
              ActivityDto.createTestInstance()
                  .withId(activity.getId())
                  .withNotes("This is a note")),
          repository.findAll());
    }

    @Test
    void failsWhenActivitiesTimestampIsDuplicated() {
      repository.save(ActivityDto.createTestInstance());
      var service = new ActivitiesService(repository);

      var result = service.logActivity(LogActivityCommand.createTestInstance());

      assertEquals(
          CommandStatus.createFailure(
              "Activity not logged because another one already exists"
                  + " with timestamp 2024-12-18T08:30:00Z."),
          result);
    }
  }

  @Nested
  class RecentActivities {

    @Test
    void returnsRecentActivities() {
      repository.saveAll(
          List.of(
              ActivityDto.createTestInstance().withTimestamp(Instant.parse("2024-12-18T08:30:00Z")),
              ActivityDto.createTestInstance().withTimestamp(Instant.parse("2024-12-17T16:00:00Z")),
              ActivityDto.createTestInstance().withTimestamp(Instant.parse("2024-12-17T15:30:00Z")),
              ActivityDto.createTestInstance()
                  .withTimestamp(Instant.parse("2024-12-17T15:00:00Z"))
                  .withTask("Make things")
                  .withNotes("This is a note")));
      var service = new ActivitiesService(repository);

      var result = service.queryRecentActivities(RecentActivitiesQuery.createTestInstance());

      assertEquals(RecentActivitiesQueryResult.createTestInstance(), result);
    }

    @Test
    void returnsNoRecentActivitiesWithoutActivities() {
      var service = new ActivitiesService(repository);

      var result = service.queryRecentActivities(RecentActivitiesQuery.createTestInstance());

      assertEquals(RecentActivitiesQueryResult.NULL, result);
    }

    @Test
    void returnsRecentActivitiesForTodayWhenQueryIsNotGiven() {
      var nowTimestamp = Instant.now();
      var now = nowTimestamp.atZone(TIME_ZONE).toLocalDateTime();

      repository.save(
          new ActivityDto(nowTimestamp, Duration.ofMinutes(20), "client-1", "project-1", "task-1"));
      var service = new ActivitiesService(repository);

      var result = service.queryRecentActivities(RecentActivitiesQuery.NULL);

      assertEquals(
          new RecentActivitiesQueryResult(
              Activity.createTestInstance()
                  .withTimestamp(now)
                  .withDuration(Duration.ofMinutes(20))
                  .withClient("client-1")
                  .withProject("project-1")
                  .withTask("task-1"),
              List.of(
                  new WorkingDay(
                      now.toLocalDate(),
                      List.of(
                          Activity.createTestInstance()
                              .withTimestamp(now)
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
