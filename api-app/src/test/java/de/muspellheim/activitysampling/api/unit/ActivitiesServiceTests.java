// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import de.muspellheim.activitysampling.api.application.ActivitiesConfiguration;
import de.muspellheim.activitysampling.api.application.ActivitiesService;
import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.TimeSummary;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetEntry;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQuery;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQueryResult;
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
      var service = new ActivitiesService(ActivitiesConfiguration.DEFAULT, store);

      var result = service.logActivity(LogActivityCommand.createTestInstance());

      assertTrue(result.success());
      assertEquals(List.of(ActivityLoggedEvent.createTestInstance()), store.replay().toList());
    }

    @Test
    void logsActivityWithOptionalNotes() {
      var service = new ActivitiesService(ActivitiesConfiguration.DEFAULT, store);

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
    void returnsLastActivity() {
      recordEvent("2025-06-09T08:30:00Z");
      recordEvent("2025-06-09T09:00:00Z");
      var service = new ActivitiesService(ActivitiesConfiguration.DEFAULT, store);

      var result = service.queryRecentActivities(RecentActivitiesQuery.DEFAULT);

      assertEquals(createActivity("2025-06-09T11:00"), result.lastActivity());
    }

    @Test
    void groupsActivitiesByWorkingDaysForTheLast30Days() {
      recordEvent("2025-05-05T14:00:00Z"); // is not included
      recordEvent("2025-05-06T14:00:00Z");
      recordEvent("2025-06-04T14:00:00Z");
      recordEvent("2025-06-05T08:30:00Z");
      recordEvent("2025-06-05T09:00:00Z");
      var service = new ActivitiesService(ActivitiesConfiguration.DEFAULT, store);

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
      recordEvent("2025-05-31T14:00:00Z"); // is not included
      // start of this month
      recordEvent("2025-06-01T14:00:00Z");
      // end of last week
      recordEvent("2025-06-01T10:00:00Z");
      // start of this week
      recordEvent("2025-06-02T10:00:00Z");
      // the day before yesterday
      recordEvent("2025-06-03T10:00:00Z");
      // yesterday
      recordEvent("2025-06-04T10:00:00Z");
      recordEvent("2025-06-04T10:30:00Z");
      recordEvent("2025-06-04T11:00:00Z");
      // today
      recordEvent("2025-06-05T09:00:00Z");
      recordEvent("2025-06-05T09:30:00Z");
      // tomorrow
      recordEvent("2025-06-06T08:30:00Z"); // is included in week and month
      // first day of next month
      recordEvent("2025-07-01T10:30:00Z"); // is not included
      var service = new ActivitiesService(ActivitiesConfiguration.DEFAULT, store);

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

    @Test
    void queriesEmptyResult() {
      var service = new ActivitiesService(ActivitiesConfiguration.DEFAULT, store);

      var result = service.queryRecentActivities(RecentActivitiesQuery.DEFAULT);

      assertEquals(RecentActivitiesQueryResult.EMPTY, result);
    }
  }

  @Nested
  class QueryTimesheet {

    @Test
    void queriesEmptyResult() {
      var service = new ActivitiesService(ActivitiesConfiguration.DEFAULT, store);

      var result = service.queryTimesheet(TimesheetQuery.createTestInstance());

      assertEquals(TimesheetQueryResult.EMPTY, result);
    }

    @Test
    void summarizesHoursWorkedOnTasks() {
      // monday, only same tasks
      recordEvent("2025-06-02T10:00:00Z");
      recordEvent("2025-06-02T10:30:00Z");
      // tuesday, different tasks
      recordEvent("2025-06-03T10:00:00Z");
      store.record(createEvent("2025-06-03T10:30:00Z").withTask("Other task"));
      // wednesday, different projects
      recordEvent("2025-06-04T10:00:00Z");
      store.record(createEvent("2025-06-04T10:30:00Z").withProject("Other project"));
      // thursday, different clients
      recordEvent("2025-06-05T10:00:00Z");
      store.record(createEvent("2025-06-05T10:30:00Z").withClient("Other client"));
      var service = new ActivitiesService(ActivitiesConfiguration.DEFAULT, store);

      var result = service.queryTimesheet(TimesheetQuery.createTestInstance());

      assertEquals(
          List.of(
              createTimesheetEntry("2025-06-02").withHours(Duration.parse("PT1H")),
              createTimesheetEntry("2025-06-03")
                  .withTask("Other task")
                  .withHours(Duration.parse("PT30M")),
              createTimesheetEntry("2025-06-03").withHours(Duration.parse("PT30M")),
              createTimesheetEntry("2025-06-04")
                  .withProject("Other project")
                  .withHours(Duration.parse("PT30M")),
              createTimesheetEntry("2025-06-04").withHours(Duration.parse("PT30M")),
              createTimesheetEntry("2025-06-05")
                  .withClient("Other client")
                  .withHours(Duration.parse("PT30M")),
              createTimesheetEntry("2025-06-05").withHours(Duration.parse("PT30M"))),
          result.entries());
    }

    @Test
    void summarizesTheTotalHoursWorked() {
      recordEvent("2025-06-02T10:00:00Z");
      recordEvent("2025-06-02T10:30:00Z");
      recordEvent("2025-06-02T11:00:00Z");
      var service = new ActivitiesService(ActivitiesConfiguration.DEFAULT, store);

      var result = service.queryTimesheet(TimesheetQuery.createTestInstance());

      assertEquals(Duration.parse("PT1H30M"), result.totalHours());
    }
  }

  private void recordEvent(String timestamp) {
    store.record(createEvent(timestamp));
  }

  private ActivityLoggedEvent createEvent(String timestamp) {
    return ActivityLoggedEvent.createTestInstance().withTimestamp(Instant.parse(timestamp));
  }

  private Activity createActivity(String timestamp) {
    return Activity.createTestInstance().withTimestamp(LocalDateTime.parse(timestamp));
  }

  private TimesheetEntry createTimesheetEntry(String date) {
    return TimesheetEntry.createTestInstance().withDate(LocalDate.parse(date));
  }
}
