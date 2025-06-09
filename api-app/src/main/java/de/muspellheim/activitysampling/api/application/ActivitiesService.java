// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.TimeSummary;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetEntry;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQuery;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.WorkingDay;
import de.muspellheim.activitysampling.api.domain.common.CommandStatus;
import de.muspellheim.activitysampling.api.infrastructure.ActivitiesStore;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Comparator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ActivitiesService {

  private final ActivitiesStore store;

  public ActivitiesService(ActivitiesStore store) {
    this.store = store;
  }

  public CommandStatus logActivity(LogActivityCommand command) {
    try {
      log.info("Log activity: {}", command);
      var event =
          ActivityLoggedEvent.builder()
              .timestamp(command.timestamp())
              .duration(command.duration())
              .client(command.client())
              .project(command.project())
              .task(command.task())
              .notes(command.notes())
              .build();
      store.record(event);
      return CommandStatus.createSuccess();
    } catch (Exception e) {
      log.error("Log activity failed: {}", e.getMessage(), e);
      throw e;
    }
  }

  public RecentActivitiesQueryResult queryRecentActivities(RecentActivitiesQuery query) {
    try {
      log.info("Query recent activities: {}", query);
      var timeZone = getTimeZone(query.timeZone());
      var today =
          query.today() != null ? query.today() : Instant.now().atZone(timeZone).toLocalDate();
      var from = today.minusDays(30).atStartOfDay().atZone(timeZone).toInstant();
      var activities =
          store
              .replay(from)
              .sorted(Comparator.comparing(ActivityLoggedEvent::timestamp).reversed())
              .map(it -> map(it, timeZone))
              .toList();
      var recentActivities = WorkingDay.from(activities);
      var timeSummary = TimeSummary.from(today, activities);
      var lastActivity = activities.isEmpty() ? null : activities.get(0);
      return new RecentActivitiesQueryResult(lastActivity, recentActivities, timeSummary, timeZone);
    } catch (Exception e) {
      log.error("Query recent activities failed: {}", e.getMessage(), e);
      throw e;
    }
  }

  public TimesheetQueryResult queryTimesheet(TimesheetQuery query) {
    try {
      log.info("Query timesheet: {}", query);
      var timeZone = getTimeZone(query.timeZone());
      var from = query.from().atStartOfDay(timeZone).toInstant();
      var to = query.to().atStartOfDay(timeZone).toInstant();
      var activities = store.replay(from, to).map(it -> map(it, timeZone)).toList();
      return TimesheetQueryResult.builder()
          .entries(TimesheetEntry.from(activities))
          .totalHours(Duration.ZERO)
          .timeZone(timeZone)
          .build();
    } catch (Exception e) {
      log.error("Query timesheet failed: {}", e.getMessage(), e);
      throw e;
    }
  }

  private ZoneId getTimeZone(ZoneId timeZone) {
    return timeZone != null ? timeZone : ZoneId.systemDefault();
  }

  private Activity map(ActivityLoggedEvent event, ZoneId timeZone) {
    return Activity.builder()
        .timestamp(event.timestamp().atZone(timeZone).toLocalDateTime())
        .duration(event.duration())
        .client(event.client())
        .project(event.project())
        .task(event.task())
        .notes(event.notes())
        .build();
  }
}
