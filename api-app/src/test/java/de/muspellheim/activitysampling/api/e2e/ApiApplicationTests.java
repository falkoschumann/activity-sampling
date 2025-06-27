// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.e2e;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import de.muspellheim.activitysampling.api.common.CommandStatus;
import de.muspellheim.activitysampling.api.domain.activities.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.activities.RecentActivitiesQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.TimeReportQueryResult;
import de.muspellheim.activitysampling.api.domain.activities.TimesheetQueryResult;
import de.muspellheim.activitysampling.api.domain.authentication.AccountInfo;
import de.muspellheim.activitysampling.api.domain.authentication.AuthenticationQueryResult;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import de.muspellheim.activitysampling.api.infrastructure.CsvActivitiesStore;
import de.muspellheim.activitysampling.api.infrastructure.CsvActivitiesStoreConfiguration;
import java.nio.file.Files;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
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
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.client.TestRestTemplate.HttpClientOption;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT, useMainMethod = UseMainMethod.ALWAYS)
class ApiApplicationTests {

  @TestConfiguration
  static class Configuration {

    @Bean
    @Primary
    Clock testingClock() {
      return Clock.fixed(Instant.parse("2025-06-04T10:00:00Z"), ZoneId.of("Europe/Berlin"));
    }
  }

  @LocalServerPort int port;

  @Autowired private CsvActivitiesStoreConfiguration configuration;

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
  class QueryRecentActivities {

    @Test
    void queriesRecentActivities() {
      var event = ActivityLoggedEvent.createTestInstance();
      store.record(
          event
              .withTimestamp(Instant.parse("2025-06-03T14:00:00Z"))
              .withTask("Other task")
              .withNotes("Other notes"));
      store.record(event.withTimestamp(Instant.parse("2025-06-03T14:30:00Z")));
      store.record(event.withTimestamp(Instant.parse("2025-06-03T15:00:00Z")));
      store.record(event.withTimestamp(Instant.parse("2025-06-04T07:30:00Z")));

      var response =
          restTemplate.getForEntity(
              "/api/activities/recent-activities?timeZone=Europe/Berlin",
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
      assertEquals(RecentActivitiesQueryResult.EMPTY, response.getBody());
    }

    @Test
    void failsWhenQueryIsNotValid() {
      var response =
          restTemplate.getForEntity(
              "/api/activities/recent-activities?timeZone=foobar", String.class);

      assertEquals(400, response.getStatusCode().value());
    }
  }

  @Nested
  class QueryTimesheet {

    @Test
    void queriesTimesheet() {
      var event = ActivityLoggedEvent.createTestInstance();
      store.record(event.withTimestamp(Instant.parse("2025-06-02T13:30:00Z")));
      store.record(event.withTimestamp(Instant.parse("2025-06-02T14:00:00Z")));
      store.record(event.withTimestamp(Instant.parse("2025-06-02T14:30:00Z")));
      store.record(event.withTimestamp(Instant.parse("2025-06-02T15:00:00Z")));
      store.record(event.withTimestamp(Instant.parse("2025-06-03T08:30:00Z")));
      store.record(event.withTimestamp(Instant.parse("2025-06-03T09:00:00Z")));
      store.record(event.withTimestamp(Instant.parse("2025-06-03T09:30:00Z")));
      store.record(event.withTimestamp(Instant.parse("2025-06-03T10:00:00Z")));

      var response =
          restTemplate.getForEntity(
              "/api/activities/timesheet?from=2025-06-02&to=2025-06-08&timeZone=Europe/Berlin",
              TimesheetQueryResult.class);

      assertEquals(200, response.getStatusCode().value());
      assertEquals(TimesheetQueryResult.createTestInstance(), response.getBody());
    }

    @Test
    void failsWhenQueryIsNotSet() {
      var response =
          restTemplate.getForEntity("/api/activities/timesheet", TimesheetQueryResult.class);

      assertEquals(400, response.getStatusCode().value());
    }

    @Test
    void failsWhenQueryIsNotValid() {
      var response =
          restTemplate.getForEntity(
              "/api/activities/timesheet?from=foobar&to=2025-06-09&timeZone=Europe/Berlin",
              TimesheetQueryResult.class);

      assertEquals(400, response.getStatusCode().value());
    }
  }

  @Nested
  class QueryTimeReport {

    @Test
    void queriesTimeReport() {
      var event = ActivityLoggedEvent.createTestInstance();
      store.record(event.withTimestamp(Instant.parse("2025-06-02T13:30:00Z")));

      var response =
          restTemplate.getForEntity(
              "/api/activities/time-report?"
                  + "from=2025-06-02"
                  + "&to=2025-06-08"
                  + "&scope=project"
                  + "&timeZone=Europe/Berlin",
              TimeReportQueryResult.class);

      assertEquals(200, response.getStatusCode().value());
      assertEquals(TimeReportQueryResult.createTestInstance(), response.getBody());
    }

    @Test
    void failsWhenQueryIsNotSet() {
      var response =
          restTemplate.getForEntity("/api/activities/time-report", TimeReportQueryResult.class);

      assertEquals(400, response.getStatusCode().value());
    }

    @Test
    void failsWhenQueryIsNotValid() {
      var response =
          restTemplate.getForEntity(
              "/api/activities/time-report?"
                  + "from=foobar"
                  + "&to=2025-06-09"
                  + "&scope=project"
                  + "&timeZone=Europe/Berlin",
              TimeReportQueryResult.class);

      assertEquals(400, response.getStatusCode().value());
    }
  }
}
