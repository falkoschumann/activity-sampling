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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class ActivitiesServiceTests {

  private static final ZoneId TIME_ZONE = ZoneId.of("Europe/Berlin");

  private ActivitiesStore store;

  @BeforeEach
  void setUp() {
    store = new MemoryActivitiesStore();
  }

  @Nested
  class LogActivity {

    @Test
    void logsActivity() {
      var service = new ActivitiesService(store);

      var result = service.logActivity(LogActivityCommand.createTestInstance());

      assertTrue(result.success());
      assertEquals(List.of(ActivityLoggedEvent.createTestInstance()), store.replay().toList());
    }

    @Test
    void logsActivityWithOptionalNotes() {
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
  class QueryRecentActivities {

    @Test
    void queriesEmptyResult() {
      var service = new ActivitiesService(store);

      var result = service.queryRecentActivities(RecentActivitiesQuery.createTestInstance());

      assertEquals(RecentActivitiesQueryResult.EMPTY, result);
    }

    @Test
    void returnsLastActivity() {
      logEvent("2025-06-09T08:30:00Z");
      logEvent("2025-06-09T09:00:00Z");
      var service = new ActivitiesService(store);

      var result = service.queryRecentActivities(RecentActivitiesQuery.DEFAULT);

      assertEquals(createActivity("2025-06-09T11:00"), result.lastActivity());
    }

    @Test
    void groupsActivitiesByWorkingDaysForTheLast30Days() {
      logEvent("2025-05-05T14:00:00Z"); // is not included
      logEvent("2025-05-06T14:00:00Z");
      logEvent("2025-06-04T14:00:00Z");
      logEvent("2025-06-05T08:30:00Z");
      logEvent("2025-06-05T09:00:00Z");
      var service = new ActivitiesService(store);

      var result =
          service.queryRecentActivities(
              RecentActivitiesQuery.DEFAULT.withToday(LocalDate.parse("2025-06-05")));

      assertEquals(
          List.of(
              WorkingDay.builder()
                  .date(LocalDate.parse("2025-06-05"))
                  .activities(
                      List.of(
                          createActivity("2025-06-05T11:00"), createActivity("2025-06-05T10:30")))
                  .build(),
              WorkingDay.builder()
                  .date(LocalDate.parse("2025-06-04"))
                  .activities(List.of(createActivity("2025-06-04T16:00")))
                  .build(),
              WorkingDay.builder()
                  .date(LocalDate.parse("2025-05-06"))
                  .activities(List.of(createActivity("2025-05-06T16:00")))
                  .build()
              // 2025-05-05 is not included because it is older than 30 days
              ),
          result.workingDays());
    }

    @Test
    void summarizesHoursWorkedTodayYesterdayThisWeekAndThisMonth() {
      // end of last month
      logEvent("2025-05-31T14:00:00Z"); // is not included
      // start of this month
      logEvent("2025-06-01T14:00:00Z");
      // end of last week
      logEvent("2025-06-01T10:00:00Z");
      // start of this week
      logEvent("2025-06-02T10:00:00Z");
      // the day before yesterday
      logEvent("2025-06-03T10:00:00Z");
      // yesterday
      logEvent("2025-06-04T10:00:00Z");
      logEvent("2025-06-04T10:30:00Z");
      logEvent("2025-06-04T11:00:00Z");
      // today
      logEvent("2025-06-05T09:00:00Z");
      logEvent("2025-06-05T09:30:00Z");
      // tomorrow
      logEvent("2025-06-06T08:30:00Z"); // is included in week and month
      // first day of next month
      logEvent("2025-07-01T10:30:00Z"); // is not included
      var service = new ActivitiesService(store);

      var result =
          service.queryRecentActivities(
              RecentActivitiesQuery.DEFAULT.withToday(LocalDate.parse("2025-06-05")));

      assertEquals(
          TimeSummary.builder()
              .hoursToday(Duration.parse("PT1H"))
              .hoursYesterday((Duration.parse("PT1H30M")))
              .hoursThisWeek((Duration.parse("PT4H00M")))
              .hoursThisMonth((Duration.parse("PT5H")))
              .build(),
          result.timeSummary());
    }
  }

  private void logEvent(String timestamp) {
    store.record(ActivityLoggedEvent.createTestInstance().withTimestamp(Instant.parse(timestamp)));
  }

  private Activity createActivity(String timestamp) {
    return Activity.createTestInstance().withTimestamp(LocalDateTime.parse(timestamp));
  }
}
