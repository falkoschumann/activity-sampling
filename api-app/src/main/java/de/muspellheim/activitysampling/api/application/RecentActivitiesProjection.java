// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.TimeSummary;
import de.muspellheim.activitysampling.api.domain.activities.WorkingDay;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

class RecentActivitiesProjection {

  private final LocalDate today;
  private final LocalDate yesterday;
  private final LocalDate thisWeekStart;
  private final LocalDate thisWeekEnd;
  private final LocalDate thisMonthStart;
  private final LocalDate nextMonthStart;
  private final ZoneId timeZone;

  private LocalDate date;
  private final List<Activity> activities = new ArrayList<>();

  private final List<WorkingDay> workingDays = new ArrayList<>();
  private Duration hoursToday = Duration.ZERO;
  private Duration hoursYesterday = Duration.ZERO;
  private Duration hoursThisWeek = Duration.ZERO;
  private Duration hoursThisMonth = Duration.ZERO;

  RecentActivitiesProjection(RecentActivitiesQuery query, Clock clock) {
    timeZone = query.timeZone() != null ? query.timeZone() : ZoneId.systemDefault();
    today = clock.instant().atZone(timeZone).toLocalDate();
    yesterday = today.minusDays(1);
    thisWeekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
    thisWeekEnd = thisWeekStart.plusDays(6);
    thisMonthStart = today.withDayOfMonth(1);
    nextMonthStart = thisMonthStart.plusMonths(1).withDayOfMonth(1);
  }

  Instant getFrom() {
    return today.minusDays(30).atStartOfDay().atZone(timeZone).toInstant();
  }

  RecentActivitiesQueryResult project(Stream<ActivityLoggedEvent> events) {
    events
        .sorted(Comparator.comparing(ActivityLoggedEvent::timestamp).reversed())
        .map(it -> ActivityMapping.map(it, timeZone))
        .forEach(
            it -> {
              updateWorkingDays(it);
              updateTimeSummary(it);
            });
    createWorkingDay();

    return RecentActivitiesQueryResult.builder()
        .lastActivity(getLastActivity())
        .workingDays(workingDays)
        .timeSummary(getTimeSummary())
        .timeZone(timeZone)
        .build();
  }

  private void updateWorkingDays(Activity activity) {
    var activityDate = activity.dateTime().toLocalDate();
    if (!activityDate.equals(date)) {
      createWorkingDay();
      date = activityDate;
      activities.clear();
    }
    activities.add(activity);
  }

  private void updateTimeSummary(Activity activity) {
    var date = activity.dateTime().toLocalDate();
    var duration = activity.duration();
    if (date.equals(today)) {
      hoursToday = hoursToday.plus(duration);
    }
    if (date.equals(yesterday)) {
      hoursYesterday = hoursYesterday.plus(duration);
    }
    if (!date.isBefore(thisWeekStart) && !date.isAfter(thisWeekEnd)) {
      hoursThisWeek = hoursThisWeek.plus(duration);
    }
    if (!date.isBefore(thisMonthStart) && date.isBefore(nextMonthStart)) {
      hoursThisMonth = hoursThisMonth.plus(duration);
    }
  }

  private void createWorkingDay() {
    if (date == null) {
      return;
    }

    var day = new WorkingDay(date, List.copyOf(activities));
    workingDays.add(day);
  }

  private Activity getLastActivity() {
    if (workingDays.isEmpty()) {
      return null;
    }

    return workingDays.get(0).activities().get(0);
  }

  private TimeSummary getTimeSummary() {
    return TimeSummary.builder()
        .hoursToday(hoursToday)
        .hoursYesterday(hoursYesterday)
        .hoursThisWeek(hoursThisWeek)
        .hoursThisMonth(hoursThisMonth)
        .build();
  }
}
