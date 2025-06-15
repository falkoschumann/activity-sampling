// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.common.CommandStatus;
import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQuery;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQueryResult;
import de.muspellheim.activitysampling.api.infrastructure.ActivitiesStore;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import de.muspellheim.activitysampling.api.infrastructure.HolidayRepository;
import java.time.Clock;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ActivitiesService {

  private final ActivitiesConfiguration configuration;
  private final ActivitiesStore store;
  private final HolidayRepository holidayRepository;
  private final Clock clock;

  public ActivitiesService(
      ActivitiesConfiguration configuration,
      ActivitiesStore store,
      HolidayRepository holidayRepository,
      Clock clock) {
    this.configuration = configuration;
    this.store = store;
    this.holidayRepository = holidayRepository;
    this.clock = clock;
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
      var projection = new RecentActivitiesProjection(query, clock);
      var replay = store.replay(projection.getFrom());
      return projection.project(replay);
    } catch (Exception e) {
      log.error("Query recent activities failed: {}", e.getMessage(), e);
      throw e;
    }
  }

  public TimesheetQueryResult queryTimesheet(TimesheetQuery query) {
    try {
      log.info("Query timesheet: {}", query);
      var holidays = holidayRepository.findAllByDate(query.from(), query.to().plusDays(1));
      var projection = new TimesheetProjection(query, configuration, holidays, clock);
      var replay = store.replay(projection.getStartInclusive(), projection.getEndExclusive());
      return projection.project(replay);
    } catch (Exception e) {
      log.error("Query timesheet failed: {}", e.getMessage(), e);
      throw e;
    }
  }
}
