/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.domain;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public record RecentActivitiesQueryResult(
    List<WorkingDay> workingDays, TimeSummary timeSummary, Activity lastActivity) {

  public static final RecentActivitiesQueryResult NULL =
      new RecentActivitiesQueryResult(List.of(), TimeSummary.NULL, null);

  public static RecentActivitiesQueryResult from(LocalDate today, List<Activity> recentActivities) {
    recentActivities =
        recentActivities.stream()
            .sorted(Comparator.comparing(Activity::timestamp).reversed())
            .toList();
    var yesterday = today.minusDays(1);
    var thisWeekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
    var thisMonthStart = today.withDayOfMonth(1);

    var workingDays = new ArrayList<WorkingDay>();
    LocalDate date = null;
    var activities = new ArrayList<Activity>();
    var hoursToday = Duration.ZERO;
    var hoursYesterday = Duration.ZERO;
    var hoursThisWeek = Duration.ZERO;
    var hoursLastWeek = Duration.ZERO;
    var lastActivity = !recentActivities.isEmpty() ? recentActivities.getFirst() : null;
    for (var activity : recentActivities) {
      if (!activity.timestamp().toLocalDate().equals(date)) {
        if (date != null) {
          workingDays.add(new WorkingDay(date, List.copyOf(activities)));
        }

        date = activity.timestamp().toLocalDate();
        activities.clear();
      }
      activities.add(activity);

      var duration = activity.duration();
      if (activity.timestamp().toLocalDate().equals(today)) {
        hoursToday = hoursToday.plus(duration);
      }
      if (activity.timestamp().toLocalDate().equals(yesterday)) {
        hoursYesterday = hoursYesterday.plus(duration);
      }
      if (!activity.timestamp().toLocalDate().isBefore(thisWeekStart)) {
        hoursThisWeek = hoursThisWeek.plus(duration);
      }
      if (!activity.timestamp().toLocalDate().isBefore(thisMonthStart)) {
        hoursLastWeek = hoursLastWeek.plus(duration);
      }
    }
    if (date != null) {
      workingDays.add(new WorkingDay(date, List.copyOf(activities)));
    }

    var timeSummary = new TimeSummary(hoursToday, hoursYesterday, hoursThisWeek, hoursLastWeek);
    return new RecentActivitiesQueryResult(workingDays, timeSummary, lastActivity);
  }

  public static RecentActivitiesQueryResult createTestInstance() {
    return new RecentActivitiesQueryResult(
        List.of(
            new WorkingDay(
                LocalDate.of(2024, 12, 18),
                List.of(
                    new Activity(
                        LocalDateTime.of(2024, 12, 18, 9, 30),
                        Duration.ofMinutes(30),
                        "ACME Inc.",
                        "Foobar",
                        "Do something"))),
            new WorkingDay(
                LocalDate.of(2024, 12, 17),
                List.of(
                    new Activity(
                        LocalDateTime.of(2024, 12, 17, 17, 0),
                        Duration.ofMinutes(30),
                        "ACME Inc.",
                        "Foobar",
                        "Do something"),
                    new Activity(
                        LocalDateTime.of(2024, 12, 17, 16, 30),
                        Duration.ofMinutes(30),
                        "ACME Inc.",
                        "Foobar",
                        "Do something"),
                    new Activity(
                        LocalDateTime.of(2024, 12, 17, 16, 0),
                        Duration.ofMinutes(30),
                        "ACME Inc.",
                        "Foobar",
                        "Make things",
                        "This is a note")))),
        new TimeSummary(
            Duration.ofMinutes(30),
            Duration.ofMinutes(90),
            Duration.ofMinutes(120),
            Duration.ofMinutes(120)),
        new Activity(
            LocalDateTime.of(2024, 12, 18, 9, 30),
            Duration.ofMinutes(30),
            "ACME Inc.",
            "Foobar",
            "Do something"));
  }
}
