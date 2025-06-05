// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.infrastructure.ActivitiesRepository;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import de.muspellheim.activitysampling.api.infrastructure.JpaActivitiesStore;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@DataJpaTest(properties = {"spring.flyway.target=1"})
class JpaActivitiesStoreTests {

  @Autowired private ActivitiesRepository repository;

  @Test
  void recordsAndReplaysEvents() {
    var store = new JpaActivitiesStore(repository);

    store.record(
        ActivityLoggedEvent.createTestInstance()
            .withTimestamp(Instant.parse("2023-01-01T11:00:00Z")));
    store.record(
        ActivityLoggedEvent.createTestInstance()
            .withTimestamp(Instant.parse("2023-01-01T12:00:00Z")));
    store.record(
        ActivityLoggedEvent.createTestInstance()
            .withTimestamp(Instant.parse("2023-01-01T13:00:00Z")));
    store.record(
        ActivityLoggedEvent.createTestInstance()
            .withTimestamp(Instant.parse("2023-01-01T14:00:00Z")));

    Instant from = Instant.parse("2023-01-01T12:00:00Z");
    Instant to = Instant.parse("2023-01-01T14:00:00Z");
    var events = store.replay(from, to).toList();

    assertEquals(
        List.of(
            ActivityLoggedEvent.createTestInstance()
                .withTimestamp(Instant.parse("2023-01-01T12:00:00Z")),
            ActivityLoggedEvent.createTestInstance()
                .withTimestamp(Instant.parse("2023-01-01T13:00:00Z"))),
        events);
  }
}
