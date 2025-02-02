/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.NonNull;

public record WorkingDay(@NonNull LocalDate date, @NonNull List<Activity> activities) {

  public static List<WorkingDay> from(List<Activity> recentActivities) {
    var workingDays = new ArrayList<WorkingDay>();
    LocalDate date = null;
    var activities = new ArrayList<Activity>();
    for (var activity : recentActivities) {
      if (!activity.timestamp().toLocalDate().equals(date)) {
        if (date != null) {
          workingDays.add(new WorkingDay(date, List.copyOf(activities)));
        }

        date = activity.timestamp().toLocalDate();
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
