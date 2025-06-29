// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.common.Lists;
import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.ReportEntry;
import de.muspellheim.activitysampling.api.domain.activities.ReportQuery;
import de.muspellheim.activitysampling.api.domain.activities.ReportQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.Scope;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

class ReportProjection {

  private final Scope scope;
  private final LocalDate startInclusive;
  private final LocalDate endExclusive;
  private final ZoneId timeZone;

  private final List<ReportEntry> entries = new ArrayList<>();
  private Duration totalHours = Duration.ZERO;

  public ReportProjection(ReportQuery query) {
    scope = query.scope();
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

  public ReportQueryResult project(Stream<ActivityLoggedEvent> events) {
    events
        .map(it -> ActivityMapping.map(it, timeZone))
        .forEach(
            it -> {
              updateEntries(it);
              updateTotalHours(it);
            });
    entries.sort(Comparator.comparing(it -> it.name().toLowerCase()));
    return ReportQueryResult.builder().entries(entries).totalHours(totalHours).build();
  }

  private void updateEntries(Activity activity) {
    switch (scope) {
      case CLIENTS -> updateEntry(activity.client(), activity.duration());
      case PROJECTS -> updateProjects(activity);
      case TASKS -> updateEntry(activity.task(), activity.duration());
      default -> throw new IllegalArgumentException("Unknown scope: " + scope);
    }
  }

  private void updateEntry(String name, Duration hours) {
    var index = Lists.indexOf(entries, it -> it.name().equals(name));
    if (index == -1) {
      entries.add(ReportEntry.builder().name(name).hours(hours).build());
    } else {
      var existingEntry = entries.get(index);
      var accumulatedHours = existingEntry.hours().plus(hours);
      var updatedEntry = existingEntry.withHours(accumulatedHours);
      entries.set(index, updatedEntry);
    }
  }

  private void updateProjects(Activity activity) {
    var project = activity.project();
    var client = activity.client();
    var index = Lists.indexOf(entries, it -> it.name().equals(project));
    if (index == -1) {
      entries.add(
          ReportEntry.builder().name(project).client(client).hours(activity.duration()).build());
    } else {
      var existingEntry = entries.get(index);
      var existingClient = existingEntry.client();
      if (!existingClient.contains(client)) {
        existingClient += ", " + client;
        existingEntry = existingEntry.withClient(existingClient);
      }
      var accumulatedHours = existingEntry.hours().plus(activity.duration());
      var updatedEntry = existingEntry.withHours(accumulatedHours);
      entries.set(index, updatedEntry);
    }
  }

  private void updateTotalHours(Activity activity) {
    totalHours = totalHours.plus(activity.duration());
  }
}
