/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.e2e;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.domain.RecentActivitiesQueryResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiApplicationTests {

  @Test
  void contextLoads() {}

  @Test
  void queriesRecentActivities(@Autowired TestRestTemplate restTemplate) {
    var response =
        restTemplate.getForEntity(
            "/api/activities/recent-activities?today=2025-01-17",
            RecentActivitiesQueryResult.class);

    assertEquals(200, response.getStatusCode().value());
    assertEquals(RecentActivitiesQueryResult.createTestInstance(), response.getBody());
  }
}
