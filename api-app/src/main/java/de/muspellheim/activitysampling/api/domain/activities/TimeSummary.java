// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record TimeSummary(
    Duration hoursToday, Duration hoursYesterday, Duration hoursThisWeek, Duration hoursThisMonth) {

  public static final TimeSummary NULL =
      new TimeSummary(Duration.ZERO, Duration.ZERO, Duration.ZERO, Duration.ZERO);

  public static TimeSummary from(LocalDate today, List<Activity> activities) {
    var yesterday = today.minusDays(1);
    var thisWeekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
    var thisMonthStart = today.withDayOfMonth(1);

    var hoursToday = Duration.ZERO;
    var hoursYesterday = Duration.ZERO;
    var hoursThisWeek = Duration.ZERO;
    var hoursThisMonth = Duration.ZERO;
    for (var activity : activities) {
      var date = activity.timestamp().toLocalDate();
      var duration = activity.duration();
      if (date.equals(today)) {
        hoursToday = hoursToday.plus(duration);
      }
      if (date.equals(yesterday)) {
        hoursYesterday = hoursYesterday.plus(duration);
      }
      if (!date.isBefore(thisWeekStart)) {
        hoursThisWeek = hoursThisWeek.plus(duration);
      }
      if (!date.isBefore(thisMonthStart)) {
        hoursThisMonth = hoursThisMonth.plus(duration);
      }
    }
    return new TimeSummary(hoursToday, hoursYesterday, hoursThisWeek, hoursThisMonth);
  }
}
