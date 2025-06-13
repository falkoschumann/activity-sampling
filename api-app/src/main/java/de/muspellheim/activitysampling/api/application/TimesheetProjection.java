// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.common.Lists;
import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetEntry;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQuery;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.WorkingHoursSummary;
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

class TimesheetProjection {

  private final LocalDate startInclusive;
  private final LocalDate endExclusive;
  private final ZoneId timeZone;
  private final Duration capacity;
  private final LocalDate today;

  private final List<TimesheetEntry> entries = new ArrayList<>();
  private Duration totalHours = Duration.ZERO;

  TimesheetProjection(TimesheetQuery query, ActivitiesConfiguration configuration, Clock clock) {
    startInclusive = query.from();
    endExclusive = query.to().plusDays(1);
    timeZone = query.timeZone() != null ? query.timeZone() : ZoneId.systemDefault();
    capacity = configuration.capacity();
    today = clock.instant().atZone(timeZone).toLocalDate();
  }

  Instant getStartInclusive() {
    return startInclusive.atStartOfDay(timeZone).toInstant();
  }

  public Instant getEndExclusive() {
    return endExclusive.atStartOfDay(timeZone).toInstant();
  }

  TimesheetQueryResult project(Stream<ActivityLoggedEvent> events) {
    events
        .sorted(Comparator.comparing(ActivityLoggedEvent::timestamp))
        .map(it -> ActivityMapping.map(it, timeZone))
        .forEach(
            it -> {
              updateEntries(it);
              updateTotalHours(it);
            });

    var sortedEntries =
        entries.stream()
            .sorted(
                Comparator.comparing(TimesheetEntry::date)
                    .thenComparing(TimesheetEntry::client)
                    .thenComparing(TimesheetEntry::project)
                    .thenComparing(TimesheetEntry::task))
            .toList();
    var offsetDays = startInclusive.until(today.plusDays(1)).getDays();
    offsetDays = Math.min(Math.max(0, offsetDays), 5);
    var offset = totalHours.minus(Duration.ofHours(offsetDays * 8L));
    return TimesheetQueryResult.builder()
        .entries(sortedEntries)
        .workingHoursSummary(
            WorkingHoursSummary.builder()
                .totalHours(totalHours)
                .capacity(capacity)
                .offset(offset)
                .build())
        .timeZone(timeZone)
        .build();
  }

  private void updateEntries(Activity activity) {
    var activityDate = activity.dateTime().toLocalDate();
    var index =
        Lists.indexOf(
            entries,
            e ->
                e.date().equals(activityDate)
                    && e.client().equals(activity.client())
                    && e.project().equals(activity.project())
                    && e.task().equals(activity.task()));
    if (index == -1) {
      var newEntry =
          TimesheetEntry.builder()
              .date(activity.dateTime().toLocalDate())
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

  private void updateTotalHours(Activity activity) {
    totalHours = totalHours.plus(activity.duration());
  }
}
