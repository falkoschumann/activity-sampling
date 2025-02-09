/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.domain.TimeSummary;
import de.muspellheim.activitysampling.api.domain.WorkingDay;
import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
public class ActivitiesService {

  private final ActivitiesRepository repository;

  public ActivitiesService(ActivitiesRepository repository) {
    this.repository = repository;
  }

  public CommandStatus logActivity(LogActivityCommand command) {
    try {
      var dto =
          ActivityDto.builder()
              .timestamp(command.timestamp().atZone(ZoneOffset.systemDefault()).toInstant())
              .duration(command.duration())
              .client(command.client())
              .project(command.project())
              .task(command.task())
              .notes(command.notes() != null ? command.notes() : "")
              .build();
      repository.save(dto);
      return CommandStatus.createSuccess();
    } catch (DuplicateKeyException e) {
      return CommandStatus.createFailure(e.getMessage());
    }
  }

  public RecentActivitiesQueryResult getRecentActivities(RecentActivitiesQuery query) {
    var timeZone = query.timeZone() != null ? query.timeZone() : ZoneId.systemDefault();
    var today =
        query.today() != null ? query.today() : Instant.now().atZone(timeZone).toLocalDate();
    var start = today.minusDays(31).atStartOfDay().atZone(timeZone).toInstant();
    var activities =
        repository.findByTimestampGreaterThanOrderByTimestampDesc(start).stream()
            .map(dto -> dto.validate(timeZone))
            .toList();

    var recentActivities = WorkingDay.from(activities);
    var timeSummary = TimeSummary.from(today, activities);
    var lastActivity = activities.isEmpty() ? null : activities.getFirst();
    return new RecentActivitiesQueryResult(lastActivity, recentActivities, timeSummary, timeZone);
  }
}
