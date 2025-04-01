// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.e2e;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import de.muspellheim.activitysampling.api.domain.CommandStatus;
import de.muspellheim.activitysampling.api.domain.LogActivityCommand;
import de.muspellheim.activitysampling.api.domain.RecentActivitiesQueryResult;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.TimeZone;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@SpringBootTest(
    webEnvironment = WebEnvironment.RANDOM_PORT,
    properties = {"spring.main.allow-bean-definition-overriding=true"})
class ApiApplicationTests {

  @TestConfiguration
  static class Config {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
      http.csrf(AbstractHttpConfigurer::disable)
          .securityMatcher("/api/**")
          .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
      return http.build();
    }
  }

  @BeforeAll
  static void setup() {
    TimeZone.setDefault(TimeZone.getTimeZone("Europe/Berlin"));
  }

  @Test
  void contextLoads() {}

  @Nested
  class LogActivity {

    @TestConfiguration
    static class Config {

      @Bean
      SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .securityMatcher("/api/**")
            .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
        return http.build();
      }
    }

    @Test
    void logsActivity(@Autowired TestRestTemplate restTemplate) {
      var response =
          restTemplate.postForEntity(
              "/api/activities/log-activity",
              LogActivityCommand.createTestInstance().withStart(Instant.now()),
              CommandStatus.class);

      assertEquals(200, response.getStatusCode().value());
      assertTrue(Objects.requireNonNull(response.getBody()).success());
    }

    @Test
    void failsWhenActivityIsNotValid(@Autowired TestRestTemplate restTemplate) throws Exception {
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

    @TestConfiguration
    static class Config {

      @Bean
      SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .securityMatcher("/api/**")
            .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());
        return http.build();
      }
    }

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
