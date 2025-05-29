// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.TimeSummary;
import de.muspellheim.activitysampling.api.domain.activities.WorkingDay;
import de.muspellheim.activitysampling.api.domain.common.CommandStatus;
import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ActivitiesService {

  private final ActivitiesRepository repository;

  public ActivitiesService(ActivitiesRepository repository) {
    this.repository = repository;
  }

  public CommandStatus logActivity(LogActivityCommand command) {
    log.info("Log activity: {}", command);
    var timestamp = command.start().atZone(ZoneOffset.systemDefault()).toInstant();
    try {
      var dto =
          ActivityDto.builder()
              .start(timestamp)
              .duration(command.duration())
              .client(command.client())
              .project(command.project())
              .task(command.task())
              .notes(command.notes() != null ? command.notes() : "")
              .build();
      repository.save(dto);
      return CommandStatus.createSuccess();
    } catch (DataIntegrityViolationException e) {
      log.error(
          "Log activity failed because of duplicate timestamp (duplicate key): {}", timestamp, e);
      return CommandStatus.createFailure(
          "Activity not logged because another one already exists with timestamp "
              + timestamp
              + ".");
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
      var start = today.minusDays(31).atStartOfDay().atZone(timeZone).toInstant();
      var activities =
          repository.findByStartGreaterThanEqualOrderByStartDesc(start).stream()
              .map(dto -> dto.validate(timeZone))
              .toList();

      var recentActivities = WorkingDay.from(activities);
      var timeSummary = TimeSummary.from(today, activities);
      var lastActivity = activities.isEmpty() ? null : activities.get(0);
      return new RecentActivitiesQueryResult(lastActivity, recentActivities, timeSummary, timeZone);
    } catch (RuntimeException e) {
      log.error("Get recent activities failed: {}", e.getMessage(), e);
      throw e;
    }
  }
}
