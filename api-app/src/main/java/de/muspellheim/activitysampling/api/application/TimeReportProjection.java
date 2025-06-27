// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.common.Lists;
import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.TimeReportEntry;
import de.muspellheim.activitysampling.api.domain.activities.TimeReportQuery;
import de.muspellheim.activitysampling.api.domain.activities.TimeReportQueryResult;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

class TimeReportProjection {

  private final LocalDate startInclusive;
  private final LocalDate endExclusive;
  private final ZoneId timeZone;

  private final List<TimeReportEntry> entries = new ArrayList<>();

  public TimeReportProjection(TimeReportQuery query, ActivitiesConfiguration configuration) {
    startInclusive = query.from();
    endExclusive = query.to().plusDays(1);
    timeZone = query.timeZone() != null ? query.timeZone() : ZoneId.systemDefault();
  }

  Instant getStartInclusive() {
    return startInclusive.atStartOfDay(timeZone).toInstant();
  }

  public Instant getEndExclusive() {
    return endExclusive.atStartOfDay(timeZone).toInstant();
  }

  public TimeReportQueryResult project(Stream<ActivityLoggedEvent> events) {
    events.map(it -> ActivityMapping.map(it, timeZone)).forEach(this::updateEntries);
    return TimeReportQueryResult.builder().entries(entries).build();
  }

  private void updateEntries(Activity activity) {
    var project = activity.project();
    var client = activity.client();
    var index =
        Lists.indexOf(entries, it -> it.name().equals(project) && it.client().equals(client));
    if (index == -1) {
      entries.add(
          TimeReportEntry.builder()
              .name(project)
              .client(client)
              .hours(activity.duration())
              .build());
    } else {
      var existingEntry = entries.get(index);
      var accumulatedHours = existingEntry.hours().plus(activity.duration());
      var updatedEntry = existingEntry.withHours(accumulatedHours);
      entries.set(index, updatedEntry);
    }
  }
}
