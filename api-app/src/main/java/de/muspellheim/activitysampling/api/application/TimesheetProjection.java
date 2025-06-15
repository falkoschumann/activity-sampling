// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.common.Lists;
import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.Calendar;
import de.muspellheim.activitysampling.api.domain.activities.Holiday;
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
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

class TimesheetProjection {

  private final LocalDate startInclusive;
  private final LocalDate endExclusive;
  private final ZoneId timeZone;
  private final Duration defaultCapacity;
  private final LocalDate today;
  private final Set<LocalDate> holidays;

  private final List<TimesheetEntry> entries = new ArrayList<>();
  private Duration totalHours = Duration.ZERO;

  TimesheetProjection(
      TimesheetQuery query,
      ActivitiesConfiguration configuration,
      List<Holiday> holidays,
      Clock clock) {
    startInclusive = query.from();
    endExclusive = query.to().plusDays(1);
    timeZone = query.timeZone() != null ? query.timeZone() : ZoneId.systemDefault();
    defaultCapacity = configuration.capacity();
    today = clock.instant().atZone(timeZone).toLocalDate();
    this.holidays = holidays.stream().map(Holiday::date).collect(Collectors.toSet());
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

    var calendar = new Calendar();
    calendar.initHolidays(holidays);
    var businessDays = calendar.countBusinessDays(startInclusive, endExclusive);
    var capacity = Duration.ofHours(businessDays * defaultCapacity.toHours() / 5);

    LocalDate end;
    if (today.isBefore(startInclusive)) {
      end = startInclusive;
    } else if (today.plusDays(1).isAfter(endExclusive)) {
      end = endExclusive;
    } else {
      end = today.plusDays(1);
    }
    businessDays = calendar.countBusinessDays(startInclusive, end);
    var offset = totalHours.minusHours(businessDays * 8);

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
        .workingHoursSummary(
            WorkingHoursSummary.builder()
                .totalHours(totalHours)
                .capacity(capacity)
                .offset(offset)
                .build())
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
