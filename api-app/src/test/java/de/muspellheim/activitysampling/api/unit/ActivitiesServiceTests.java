/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.*;

import de.muspellheim.activitysampling.api.application.ActivitiesService;
import de.muspellheim.activitysampling.api.domain.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import org.junit.jupiter.api.Test;

class ActivitiesServiceTests {

  @Test
  void buildsRecentActivities() {
    var repository = new ActivitiesRepository();
    var service = new ActivitiesService(repository);

    var result = service.queryRecentActivities();

    assertEquals(RecentActivitiesQueryResult.createTestInstance(), result);
  }
}
