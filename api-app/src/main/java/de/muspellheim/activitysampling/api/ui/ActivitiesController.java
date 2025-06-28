// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import de.muspellheim.activitysampling.api.application.ActivitiesService;
import de.muspellheim.activitysampling.api.common.CommandStatus;
import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.ReportQuery;
import de.muspellheim.activitysampling.api.domain.activities.ReportQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.Scope;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQuery;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQueryResult;
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
    return service.logActivity(command);
  }

  @GetMapping("/recent-activities")
  public RecentActivitiesQueryResult queryRecentActivities(
      @RequestParam(required = false) @Valid ZoneId timeZone) {
    var query = RecentActivitiesQuery.builder().timeZone(timeZone).build();
    return service.queryRecentActivities(query);
  }

  @GetMapping("/timesheet")
  public TimesheetQueryResult queryTimesheet(
      @RequestParam @Valid LocalDate from,
      @RequestParam @Valid LocalDate to,
      @RequestParam(required = false) @Valid ZoneId timeZone) {
    var query = TimesheetQuery.builder().from(from).to(to).timeZone(timeZone).build();
    return service.queryTimesheet(query);
  }

  @GetMapping("/report")
  public ReportQueryResult queryReport(
      @RequestParam @Valid LocalDate from,
      @RequestParam @Valid LocalDate to,
      @RequestParam @Valid Scope scope,
      @RequestParam(required = false) @Valid ZoneId timeZone) {
    var query = ReportQuery.builder().scope(scope).from(from).to(to).timeZone(timeZone).build();
    return service.queryReport(query);
  }
}
