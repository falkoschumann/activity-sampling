// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import de.muspellheim.activitysampling.api.application.ActivitiesService;
import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.common.CommandStatus;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activities")
public class ActivitiesController {

  private final ActivitiesService service;

  public ActivitiesController(ActivitiesService service) {
    this.service = service;
  }

  @PostMapping("/log-activity")
  public CommandStatus logActivity(@RequestBody @Valid LogActivityCommand command) {
    return this.service.logActivity(command);
  }

  @GetMapping("/recent-activities")
  public RecentActivitiesQueryResult recentActivities(
      @RequestParam(required = false) @Valid LocalDate today,
      @RequestParam(required = false) @Valid ZoneId timeZone) {
    return this.service.queryRecentActivities(new RecentActivitiesQuery(today, timeZone));
  }
}
