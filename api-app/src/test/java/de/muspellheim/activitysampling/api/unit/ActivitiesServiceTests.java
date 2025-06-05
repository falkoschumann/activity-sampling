// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import de.muspellheim.activitysampling.api.application.ActivitiesService;
import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.TimeSummary;
import de.muspellheim.activitysampling.api.domain.activities.WorkingDay;
import de.muspellheim.activitysampling.api.infrastructure.ActivitiesStore;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class ActivitiesServiceTests {

  // TODO Align with user stories

  private static final ZoneId TIME_ZONE = ZoneId.of("Europe/Berlin");

  private ActivitiesStore store;

  @BeforeEach
  void setUp() {
    store = new MemoryActivitiesStore();
  }

  @Nested
  class LogActivity {

    @Test
    void logsActivityWithoutNotes() {
      var service = new ActivitiesService(store);

      var result = service.logActivity(LogActivityCommand.createTestInstance());

      assertTrue(result.success());
      assertEquals(List.of(ActivityLoggedEvent.createTestInstance()), store.replay().toList());
    }

    @Test
    void logsActivityWithNotes() {
      var service = new ActivitiesService(store);

      var result =
          service.logActivity(LogActivityCommand.createTestInstance().withNotes("This is a note"));

      assertTrue(result.success());
      assertEquals(
          List.of(ActivityLoggedEvent.createTestInstance().withNotes("This is a note")),
          store.replay().toList());
    }
  }

  @Nested
  class RecentActivities {

    @Test
    void returnsRecentActivities() {
      store.record(
          ActivityLoggedEvent.createTestInstance()
              .withTimestamp(Instant.parse("2024-12-17T15:00:00Z"))
              .withTask("Make things")
              .withNotes("This is a note"));
      store.record(
          ActivityLoggedEvent.createTestInstance()
              .withTimestamp(Instant.parse("2024-12-17T15:30:00Z")));
      store.record(
          ActivityLoggedEvent.createTestInstance()
              .withTimestamp(Instant.parse("2024-12-17T16:00:00Z")));
      store.record(
          ActivityLoggedEvent.createTestInstance()
              .withTimestamp(Instant.parse("2024-12-18T08:30:00Z")));
      var service = new ActivitiesService(store);

      var result = service.queryRecentActivities(RecentActivitiesQuery.createTestInstance());

      assertEquals(RecentActivitiesQueryResult.createTestInstance(), result);
    }

    @Test
    void returnsNoRecentActivitiesWithoutActivities() {
      var service = new ActivitiesService(store);

      var result = service.queryRecentActivities(RecentActivitiesQuery.createTestInstance());

      assertEquals(RecentActivitiesQueryResult.NULL, result);
    }

    @Test
    void returnsRecentActivitiesForTodayWhenQueryIsNotGiven() {
      var nowTimestamp = Instant.now();
      var now = nowTimestamp.atZone(TIME_ZONE).toLocalDateTime();

      store.record(
          ActivityLoggedEvent.builder()
              .timestamp(nowTimestamp)
              .duration(Duration.ofMinutes(20))
              .client("client-1")
              .project("project-1")
              .task("task-1")
              .build());
      var service = new ActivitiesService(store);

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
