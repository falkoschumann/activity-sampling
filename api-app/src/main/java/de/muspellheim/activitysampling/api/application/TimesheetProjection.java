// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.common.Lists;
import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetEntry;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQuery;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQueryResult;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

class TimesheetProjection {

  private LocalDate from;
  private LocalDate to;
  private final ZoneId timeZone;

  private List<TimesheetEntry> entries = new ArrayList<TimesheetEntry>();

  TimesheetProjection(TimesheetQuery query) {
    from = query.from();
    to = query.to();
    timeZone = query.timeZone() != null ? query.timeZone() : ZoneId.systemDefault();
  }

  Instant getFrom() {
    return from.atStartOfDay(timeZone).toInstant();
  }

  public Instant getTo() {
    return to.atStartOfDay(timeZone).toInstant();
  }

  TimesheetQueryResult project(Stream<ActivityLoggedEvent> events) {
    events.forEach(
        it -> {
          var activity = map(it);
          updateEntries(activity);
        });

    var sortedEntries =
        entries.stream()
            .sorted(
                Comparator.comparing(TimesheetEntry::date)
                    .thenComparing(TimesheetEntry::client)
                    .thenComparing(TimesheetEntry::project)
                    .thenComparing(TimesheetEntry::task))
            .toList();
    return TimesheetQueryResult.builder()
        .entries(sortedEntries)
        .totalHours(Duration.ZERO)
        .timeZone(timeZone)
        .build();
  }

  private Activity map(ActivityLoggedEvent event) {
    return Activity.builder()
        .timestamp(event.timestamp().atZone(timeZone).toLocalDateTime())
        .duration(event.duration())
        .client(event.client())
        .project(event.project())
        .task(event.task())
        .notes(event.notes())
        .build();
  }

  private void updateEntries(Activity activity) {
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
}
