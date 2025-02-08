/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.domain;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import lombok.NonNull;

public record WorkingDay(@NonNull LocalDate date, @NonNull List<Activity> activities) {

  public static List<WorkingDay> from(List<Activity> recentActivities) {
    var workingDays = new ArrayList<WorkingDay>();
    LocalDate date = null;
    var activities = new ArrayList<Activity>();
    for (var activity : recentActivities) {
      // TODO Handle time zone
      var activityDate = activity.timestamp().atZone(ZoneId.systemDefault()).toLocalDate();
      if (!activityDate.equals(date)) {
        if (date != null) {
          workingDays.add(new WorkingDay(date, List.copyOf(activities)));
        }

        date = activityDate;
        activities.clear();
      }
      activities.add(activity);
    }
    if (date != null) {
      workingDays.add(new WorkingDay(date, List.copyOf(activities)));
    }
    return workingDays;
  }
}
