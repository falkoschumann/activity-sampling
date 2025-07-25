// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import de.muspellheim.activitysampling.api.application.ActivitiesConfiguration;
import de.muspellheim.activitysampling.api.application.ActivitiesService;
import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.Holiday;
import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.ReportEntry;
import de.muspellheim.activitysampling.api.domain.activities.ReportQuery;
import de.muspellheim.activitysampling.api.domain.activities.ReportQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.Scope;
import de.muspellheim.activitysampling.api.domain.activities.TimeSummary;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetEntry;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQuery;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.WorkingDay;
import de.muspellheim.activitysampling.api.domain.activities.WorkingHoursSummary;
import de.muspellheim.activitysampling.api.infrastructure.ActivitiesStore;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import java.time.Clock;
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
  private static final Clock CLOCK = Clock.fixed(Instant.parse("2025-06-04T10:00:00Z"), TIME_ZONE);

  private ActivitiesStore store;

  @BeforeEach
  void setUp() {
    store = new MemoryActivitiesStore();
  }

  @Nested
  class LogActivity {

    @Test
    void logsActivity() {
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.logActivity(LogActivityCommand.createTestInstance());

      assertTrue(result.success());
      assertEquals(List.of(ActivityLoggedEvent.createTestInstance()), store.replay().toList());
    }

    @Test
    void logsActivityWithOptionalNotes() {
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

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
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

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
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT,
              store,
              new MemoryHolidayRepository(),
              Clock.fixed(Instant.parse("2025-06-05T10:00:00Z"), TIME_ZONE));

      var result = service.queryRecentActivities(RecentActivitiesQuery.DEFAULT);

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
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT,
              store,
              new MemoryHolidayRepository(),
              Clock.fixed(Instant.parse("2025-06-05T10:00:00Z"), TIME_ZONE));

      var result = service.queryRecentActivities(RecentActivitiesQuery.DEFAULT);

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
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryRecentActivities(RecentActivitiesQuery.DEFAULT);

      assertEquals(RecentActivitiesQueryResult.EMPTY, result);
    }
  }

  @Nested
  class QueryTimesheet {

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
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

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
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryTimesheet(TimesheetQuery.createTestInstance());

      assertEquals(Duration.parse("PT1H30M"), result.workingHoursSummary().totalHours());
    }

    @Test
    void comparesWithCapacityForDay() {
      var today = LocalDate.parse("2025-06-03");
      store.record(createEvent("2025-06-03T07:00:00Z"));
      store.record(createEvent("2025-06-03T07:30:00Z"));
      store.record(createEvent("2025-06-03T08:00:00Z"));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryTimesheet(TimesheetQuery.builder().from(today).to(today).build());

      assertEquals(
          WorkingHoursSummary.builder()
              .totalHours(Duration.parse("PT1H30M"))
              .offset(Duration.parse("-PT6H30M"))
              .capacity(Duration.ofHours(8))
              .build(),
          result.workingHoursSummary());
    }

    @Test
    void comparesWithCapacityForWeek() {
      store.record(createEvent("2025-06-02T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-03T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-04T14:00:00Z").withDuration(Duration.ofHours(8)));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryTimesheet(TimesheetQuery.createTestInstance());

      assertEquals(
          WorkingHoursSummary.builder()
              .totalHours(Duration.ofHours(24))
              .offset(Duration.ZERO)
              .capacity(Duration.ofHours(40))
              .build(),
          result.workingHoursSummary());
    }

    @Test
    void comparesWithCapacityForMonth() {
      var from = LocalDate.parse("2025-06-01");
      var to = LocalDate.parse("2025-06-30");
      store.record(createEvent("2025-06-02T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-03T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-04T14:00:00Z").withDuration(Duration.ofHours(8)));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryTimesheet(TimesheetQuery.builder().from(from).to(to).build());

      assertEquals(
          WorkingHoursSummary.builder()
              .totalHours(Duration.ofHours(24))
              .offset(Duration.ZERO)
              .capacity(Duration.ofHours(168))
              .build(),
          result.workingHoursSummary());
    }

    @Test
    void comparesWithCapacityAndTotalHoursBehindCapacity() {
      store.record(createEvent("2025-06-02T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-03T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-04T10:00:00Z").withDuration(Duration.ofHours(4)));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryTimesheet(TimesheetQuery.createTestInstance());

      assertEquals(
          WorkingHoursSummary.builder()
              .totalHours(Duration.ofHours(20))
              .offset(Duration.ofHours(-4))
              .capacity(Duration.ofHours(40))
              .build(),
          result.workingHoursSummary());
    }

    @Test
    void comparesWithCapacityAndTotalHoursAheadCapacity() {
      store.record(createEvent("2025-06-02T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-03T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-04T16:00:00Z").withDuration(Duration.ofHours(10)));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryTimesheet(TimesheetQuery.createTestInstance());

      assertEquals(
          WorkingHoursSummary.builder()
              .totalHours(Duration.ofHours(26))
              .offset(Duration.ofHours(2))
              .capacity(Duration.ofHours(40))
              .build(),
          result.workingHoursSummary());
    }

    @Test
    void comparesWithCapacityAndTodayIsInFuture() {
      store.record(createEvent("2025-06-02T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-03T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-04T14:00:00Z").withDuration(Duration.ofHours(8)));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT,
              store,
              new MemoryHolidayRepository(),
              Clock.fixed(Instant.parse("2025-06-11T10:00:00Z"), TIME_ZONE));

      var result = service.queryTimesheet(TimesheetQuery.createTestInstance());

      assertEquals(
          WorkingHoursSummary.builder()
              .totalHours(Duration.ofHours(24))
              .offset(Duration.ofHours(-16))
              .capacity(Duration.ofHours(40))
              .build(),
          result.workingHoursSummary());
    }

    @Test
    void comparesWeekWithHoliday() {
      store.record(createEvent("2025-06-10T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-11T14:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-12T14:00:00Z").withDuration(Duration.ofHours(8)));
      var holidayRepository = new MemoryHolidayRepository();
      holidayRepository.add(
          Holiday.builder().date(LocalDate.parse("2025-06-09")).title("Pfingstmontag").build());
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT,
              store,
              holidayRepository,
              Clock.fixed(Instant.parse("2025-06-13T10:00:00Z"), TIME_ZONE));

      var result =
          service.queryTimesheet(
              TimesheetQuery.builder()
                  .from(LocalDate.parse("2025-06-09"))
                  .to(LocalDate.parse("2025-06-15"))
                  .timeZone(ZoneId.of("Europe/Berlin"))
                  .build());

      assertEquals(
          WorkingHoursSummary.builder()
              .totalHours(Duration.ofHours(24))
              .offset(Duration.ofHours(-8))
              .capacity(Duration.ofHours(32))
              .build(),
          result.workingHoursSummary());
    }

    @Test
    void queriesEmptyResult() {
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryTimesheet(TimesheetQuery.createTestInstance());

      assertEquals(
          TimesheetQueryResult.EMPTY.withWorkingHoursSummary(
              WorkingHoursSummary.EMPTY.withOffset(Duration.ofHours(-24))),
          result);
    }
  }

  @Nested
  class QueryReport {

    @Test
    void summarizesHoursWorkedForClients() {
      store.record(
          createEvent("2025-06-25T15:00:00Z")
              .withClient("Client 2")
              .withDuration(Duration.ofHours(7)));
      store.record(
          createEvent("2025-06-26T15:00:00Z")
              .withClient("Client 1")
              .withDuration(Duration.ofHours(5)));
      store.record(
          createEvent("2025-06-27T15:00:00Z")
              .withClient("Client 1")
              .withDuration(Duration.ofHours(3)));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryReport(ReportQuery.createTestInstance().withScope(Scope.CLIENTS));

      assertEquals(
          List.of(
              ReportEntry.builder().name("Client 1").hours(Duration.ofHours(8)).build(),
              ReportEntry.builder().name("Client 2").hours(Duration.ofHours(7)).build()),
          result.entries());
    }

    @Test
    void summarizesHoursWorkedOnProjects() {
      store.record(createEvent("2025-06-02T15:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-03T15:00:00Z").withDuration(Duration.ofHours(9)));
      store.record(createEvent("2025-06-04T15:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-05T15:00:00Z").withDuration(Duration.ofHours(9)));
      store.record(createEvent("2025-06-06T15:00:00Z").withDuration(Duration.ofHours(8)));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryReport(ReportQuery.createTestInstance());

      assertEquals(ReportQueryResult.createTestInstance(), result);
    }

    @Test
    void summarizesHoursWorkedOnProjectsAndCombinesProjectsWithMultipleClients() {
      store.record(
          createEvent("2025-06-02T15:00:00Z")
              .withDuration(Duration.ofHours(8))
              .withClient("Client 1"));
      store.record(
          createEvent("2025-06-03T15:00:00Z")
              .withDuration(Duration.ofHours(9))
              .withClient("Client 2"));
      store.record(
          createEvent("2025-06-04T15:00:00Z")
              .withDuration(Duration.ofHours(8))
              .withClient("Client 1"));
      store.record(
          createEvent("2025-06-05T15:00:00Z")
              .withDuration(Duration.ofHours(9))
              .withClient("Client 2"));
      store.record(
          createEvent("2025-06-06T15:00:00Z")
              .withDuration(Duration.ofHours(8))
              .withClient("Client 1"));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryReport(ReportQuery.createTestInstance());

      assertEquals(
          List.of(ReportEntry.createTestInstance().withClient("Client 1, Client 2")),
          result.entries());
    }

    @Test
    void summarizesHoursWorkedOnTasks() {
      store.record(
          createEvent("2025-06-25T15:00:00Z").withTask("Task 2").withDuration(Duration.ofHours(7)));
      store.record(
          createEvent("2025-06-26T15:00:00Z").withTask("Task 1").withDuration(Duration.ofHours(5)));
      store.record(
          createEvent("2025-06-27T15:00:00Z").withTask("Task 1").withDuration(Duration.ofHours(3)));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryReport(ReportQuery.createTestInstance().withScope(Scope.TASKS));

      assertEquals(
          List.of(
              ReportEntry.builder().name("Task 1").hours(Duration.ofHours(8)).build(),
              ReportEntry.builder().name("Task 2").hours(Duration.ofHours(7)).build()),
          result.entries());
    }

    @Test
    void summarizesTheTotalHoursWorked() {
      store.record(createEvent("2025-06-02T15:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-03T15:00:00Z").withDuration(Duration.ofHours(9)));
      store.record(createEvent("2025-06-04T15:00:00Z").withDuration(Duration.ofHours(8)));
      store.record(createEvent("2025-06-05T15:00:00Z").withDuration(Duration.ofHours(9)));
      store.record(createEvent("2025-06-06T15:00:00Z").withDuration(Duration.ofHours(8)));
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryReport(ReportQuery.createTestInstance());

      assertEquals(Duration.parse("PT42H"), result.totalHours());
    }

    @Test
    void queriesEmptyResult() {
      var service =
          new ActivitiesService(
              ActivitiesConfiguration.DEFAULT, store, new MemoryHolidayRepository(), CLOCK);

      var result = service.queryReport(ReportQuery.createTestInstance());

      assertEquals(ReportQueryResult.EMPTY, result);
    }
  }

  private void recordEvent(String timestamp) {
    store.record(createEvent(timestamp));
  }

  private ActivityLoggedEvent createEvent(String timestamp) {
    return ActivityLoggedEvent.createTestInstance().withTimestamp(Instant.parse(timestamp));
  }

  private Activity createActivity(String timestamp) {
    return Activity.createTestInstance().withDateTime(LocalDateTime.parse(timestamp));
  }

  private TimesheetEntry createTimesheetEntry(String date) {
    return TimesheetEntry.createTestInstance().withDate(LocalDate.parse(date));
  }
}
