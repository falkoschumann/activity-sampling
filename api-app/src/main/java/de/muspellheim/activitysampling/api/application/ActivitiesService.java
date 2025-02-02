/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.domain.TimeSummary;
import de.muspellheim.activitysampling.api.domain.WorkingDay;
import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityDto;
import java.time.LocalDate;
import java.time.ZoneOffset;
import org.springframework.stereotype.Service;

@Service
public class ActivitiesService {

  private final ActivitiesRepository repository;

  public ActivitiesService(ActivitiesRepository repository) {
    this.repository = repository;
  }

  public RecentActivitiesQueryResult getRecentActivities(RecentActivitiesQuery query) {
    var today = query.today() != null ? query.today() : LocalDate.now();
    var start = today.minusDays(31).atStartOfDay();
    var startTimestamp = start.toInstant(ZoneOffset.UTC);
    var activities =
        repository.findByTimestampGreaterThanOrderByTimestampDesc(startTimestamp).stream()
            .map(ActivityDto::validate)
            .toList();

    var recentActivities = WorkingDay.from(activities);
    var timeSummary = TimeSummary.from(today, activities);
    var lastActivity = activities.isEmpty() ? null : activities.getFirst();
    return new RecentActivitiesQueryResult(lastActivity, recentActivities, timeSummary);
  }
}
