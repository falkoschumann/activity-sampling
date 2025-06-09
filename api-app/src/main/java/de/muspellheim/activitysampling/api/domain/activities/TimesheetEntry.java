// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import com.fasterxml.jackson.annotation.JsonInclude;
import de.muspellheim.activitysampling.api.common.Lists;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.Builder;
import lombok.With;

@Builder
@With
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TimesheetEntry(
    LocalDate date, String client, String project, String task, Duration hours) {

  public static List<TimesheetEntry> from(List<Activity> activities) {
    var entries = new ArrayList<TimesheetEntry>();
    for (var activity : activities) {
      var date = activity.timestamp().toLocalDate();
      var index =
          Lists.indexOf(
              entries,
              e ->
                  e.date().equals(date)
                      && e.client().equals(activity.client())
                      && e.project().equals(activity.project())
                      && e.task().equals(activity.task()));
      if (index == -1) {
        var newEntry =
            TimesheetEntry.builder()
                .date(activity.timestamp().toLocalDate())
                .client(activity.client())
                .project(activity.project())
                .task(activity.task())
                .hours(activity.duration())
                .build();
        entries.add(newEntry);
      } else {
        var existingEntry = entries.get(index);
        var accumulatedHours = existingEntry.hours().plus(activity.duration());
        var updatedEntry = existingEntry.withHours(accumulatedHours);
        entries.set(index, updatedEntry);
      }
    }
    return entries.stream()
        .sorted(
            Comparator.comparing(TimesheetEntry::date)
                .thenComparing(TimesheetEntry::client)
                .thenComparing(TimesheetEntry::project)
                .thenComparing(TimesheetEntry::task))
        .toList();
  }

  public static TimesheetEntry createTestInstance() {
    return TimesheetEntry.builder()
        .date(LocalDate.parse("2025-06-04"))
        .client("Test client")
        .project("Test project")
        .task("Test task")
        .hours(Duration.ofHours(2))
        .build();
  }
}
