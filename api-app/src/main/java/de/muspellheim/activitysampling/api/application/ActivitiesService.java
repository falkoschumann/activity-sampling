/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.domain.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.RecentActivitiesQueryResult;
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
    var startDate = query.today() != null ? query.today() : LocalDate.now();
    var start = startDate.minusDays(31).atStartOfDay();
    var timestamp = start.toInstant(ZoneOffset.UTC);
    var activities =
        repository.findByTimestampGreaterThanOrderByTimestampDesc(timestamp).stream()
            .map(ActivityDto::validate)
            .toList();
    return RecentActivitiesQueryResult.from(startDate, activities);
  }
}
