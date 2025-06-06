// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.e2e;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.authentication.AccountInfo;
import de.muspellheim.activitysampling.api.domain.authentication.AuthenticationQueryResult;
import de.muspellheim.activitysampling.api.domain.common.CommandStatus;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import de.muspellheim.activitysampling.api.infrastructure.CsvActivitiesStore;
import de.muspellheim.activitysampling.api.infrastructure.FileStoreConfiguration;
import java.nio.file.Files;
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
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT, useMainMethod = UseMainMethod.ALWAYS)
class ApiApplicationTests {

  @LocalServerPort int port;

  @Autowired private FileStoreConfiguration configuration;

  @Autowired private CsvActivitiesStore store;

  @Autowired RestTemplateBuilder restTemplateBuilder;

  private TestRestTemplate restTemplate;

  @BeforeAll
  static void setup() {
    TimeZone.setDefault(TimeZone.getTimeZone("Europe/Berlin"));
  }

  @BeforeEach
  void init() throws Exception {
    Files.deleteIfExists(configuration.file());
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
              LogActivityCommand.createTestInstance().withTimestamp(Instant.now()),
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
      var event = ActivityLoggedEvent.createTestInstance();
      store.record(
          event
              .withTimestamp(Instant.parse("2024-12-17T15:00:00Z"))
              .withTask("Make things")
              .withNotes("This is a note"));
      store.record(event.withTimestamp(Instant.parse("2024-12-17T15:30:00Z")));
      store.record(event.withTimestamp(Instant.parse("2024-12-17T16:00:00Z")));
      store.record(event.withTimestamp(Instant.parse("2024-12-18T08:30:00Z")));

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
