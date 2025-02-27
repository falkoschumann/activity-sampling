// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.e2e;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.application.CommandStatus;
import de.muspellheim.activitysampling.api.application.LogActivityCommand;
import de.muspellheim.activitysampling.api.application.RecentActivitiesQueryResult;
import java.util.TimeZone;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiApplicationTests {

  @BeforeAll
  static void setup() {
    TimeZone.setDefault(TimeZone.getTimeZone("Europe/Berlin"));
  }

  @Test
  void contextLoads() {}

  @Nested
  class LogActivity {

    @Test
    void logsActivity(@Autowired TestRestTemplate restTemplate) {
      var response =
          restTemplate.postForEntity(
              "/api/activities/log-activity",
              LogActivityCommand.createTestInstance(),
              CommandStatus.class);

      assertEquals(200, response.getStatusCode().value());
      assertEquals(CommandStatus.createSuccess(), response.getBody());
    }

    @Test
    void failsWhenActivityIsNotValid(@Autowired TestRestTemplate restTemplate) throws Exception {
      var command = new JSONObject().put("timestamp", "foobar");
      var headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      var request = new HttpEntity<>(command.toString(), headers);
      var response =
          restTemplate.postForEntity("/api/activities/log-activity", request, CommandStatus.class);

      assertEquals(400, response.getStatusCode().value());
    }
  }

  @Nested
  class RecentActivities {

    @Test
    void queriesRecentActivities(@Autowired TestRestTemplate restTemplate) {
      var response =
          restTemplate.getForEntity(
              "/api/activities/recent-activities?today=2024-12-18&timeZone=Europe/Berlin",
              RecentActivitiesQueryResult.class);

      assertEquals(200, response.getStatusCode().value());
      assertEquals(RecentActivitiesQueryResult.createTestInstance(), response.getBody());
    }

    @Test
    void doesNotFailWhenQueryIsNotSet(@Autowired TestRestTemplate restTemplate) {
      var response =
          restTemplate.getForEntity(
              "/api/activities/recent-activities", RecentActivitiesQueryResult.class);

      assertEquals(200, response.getStatusCode().value());
      assertEquals(RecentActivitiesQueryResult.NULL, response.getBody());
    }

    @Test
    void failsWhenQueryIsNotValid(@Autowired TestRestTemplate restTemplate) {
      var response =
          restTemplate.getForEntity("/api/activities/recent-activities?today=foobar", String.class);

      assertEquals(400, response.getStatusCode().value());
    }
  }
}
