/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.ui;

import de.muspellheim.activitysampling.api.application.ActivitiesService;
import de.muspellheim.activitysampling.api.application.RecentActivitiesQuery;
import de.muspellheim.activitysampling.api.application.RecentActivitiesQueryResult;
import java.time.LocalDate;
import org.springframework.web.bind.annotation.GetMapping;
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

  @GetMapping("/recent-activities")
  public RecentActivitiesQueryResult recentActivities(
      @RequestParam(required = false) LocalDate today) {
    return this.service.getRecentActivities(new RecentActivitiesQuery(today));
  }
}
