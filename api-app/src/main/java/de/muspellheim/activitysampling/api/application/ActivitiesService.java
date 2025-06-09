// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.TimeSummary;
import de.muspellheim.activitysampling.api.domain.activities.WorkingDay;
import de.muspellheim.activitysampling.api.domain.common.CommandStatus;
import de.muspellheim.activitysampling.api.infrastructure.ActivitiesStore;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
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
      log.info("Get recent activities: {}", query);
      var timeZone = query.timeZone() != null ? query.timeZone() : ZoneId.systemDefault();
      var today =
          query.today() != null ? query.today() : Instant.now().atZone(timeZone).toLocalDate();
      var from = today.minusDays(30).atStartOfDay().atZone(timeZone).toInstant();
      var activities =
          store
              .replay(from)
              .sorted(Comparator.comparing(ActivityLoggedEvent::timestamp).reversed())
              .map(
                  it ->
                      Activity.builder()
                          .timestamp(it.timestamp().atZone(timeZone).toLocalDateTime())
                          .duration(it.duration())
                          .client(it.client())
                          .project(it.project())
                          .task(it.task())
                          .notes(it.notes())
                          .build())
              .toList();
      var recentActivities = WorkingDay.from(activities);
      var timeSummary = TimeSummary.from(today, activities);
      var lastActivity = activities.isEmpty() ? null : activities.get(0);
      return new RecentActivitiesQueryResult(lastActivity, recentActivities, timeSummary, timeZone);
    } catch (Exception e) {
      log.error("Get recent activities failed: {}", e.getMessage(), e);
      throw e;
    }
  }
}
