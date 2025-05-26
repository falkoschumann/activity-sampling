// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.e2e;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import de.muspellheim.activitysampling.api.domain.AccountInfo;
import de.muspellheim.activitysampling.api.domain.AuthenticationQueryResult;
import de.muspellheim.activitysampling.api.domain.CommandStatus;
import de.muspellheim.activitysampling.api.domain.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.RecentActivitiesQueryResult;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TimeZone;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.UseMainMethod;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.client.TestRestTemplate.HttpClientOption;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@SpringBootTest(
    webEnvironment = WebEnvironment.RANDOM_PORT,
    useMainMethod = UseMainMethod.ALWAYS,
    properties = "spring.profiles.active=test")
class ApiApplicationTests {

  @LocalServerPort int port;

  @Autowired RestTemplateBuilder restTemplateBuilder;

  private TestRestTemplate restTemplate;

  @BeforeAll
  static void setup() {
    TimeZone.setDefault(TimeZone.getTimeZone("Europe/Berlin"));
  }

  @BeforeEach
  void init() {
    var restTemplate = restTemplateBuilder.rootUri("http://localhost:" + port);
    this.restTemplate =
        new TestRestTemplate(restTemplate, "user", "password", HttpClientOption.ENABLE_COOKIES);
  }

  @Test
  void contextLoads() {}

  @Nested
  class Authentication {

    @Test
    void authentication() {
      var response =
          restTemplate.getForEntity("/api/authentication", AuthenticationQueryResult.class);

      assertEquals(200, response.getStatusCode().value());
      assertEquals(
          AuthenticationQueryResult.of(
              AccountInfo.builder().username("user").roles(List.of("USER")).build()),
          Objects.requireNonNull(response.getBody()));
    }
  }

  @Nested
  class LogActivity {

    @Test
    void logsActivity() {
      var response =
          restTemplate.postForEntity(
              "/api/activities/log-activity",
              LogActivityCommand.createTestInstance().withStart(Instant.now()),
              CommandStatus.class);

      assertEquals(200, response.getStatusCode().value());
      assertTrue(Objects.requireNonNull(response.getBody()).success());
    }

    @Test
    void failsWhenActivityIsNotValid() throws Exception {
      var command =
          new JSONObject()
              .put("start", "2025-03-13T17:46:00Z")
              .put("duration", "PT30M")
              // .put("client", "client-1") missing property
              .put("project", "project-1")
              .put("task", "task-1");
      var headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      var request = new HttpEntity<>(command.toString(), headers);
      var response = restTemplate.postForEntity("/api/activities/log-activity", request, Map.class);

      assertEquals(400, response.getStatusCode().value());
    }
  }

  @Nested
  class RecentActivities {

    @Test
    void queriesRecentActivities() {
      var response =
          restTemplate.getForEntity(
              "/api/activities/recent-activities?today=2024-12-18&timeZone=Europe/Berlin",
              RecentActivitiesQueryResult.class);

      assertEquals(200, response.getStatusCode().value());
      assertEquals(RecentActivitiesQueryResult.createTestInstance(), response.getBody());
    }

    @Test
    void doesNotFailWhenQueryIsNotSet() {
      var response =
          restTemplate.getForEntity(
              "/api/activities/recent-activities", RecentActivitiesQueryResult.class);

      assertEquals(200, response.getStatusCode().value());
      assertEquals(RecentActivitiesQueryResult.NULL, response.getBody());
    }

    @Test
    void failsWhenQueryIsNotValid() {
      var response =
          restTemplate.getForEntity("/api/activities/recent-activities?today=foobar", String.class);

      assertEquals(400, response.getStatusCode().value());
    }
  }
}
