/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.infrastructure;

import de.muspellheim.activitysampling.api.domain.Activity;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ActivitiesRepository {

  public List<Activity> findOrderByTimestampDesc() {
    return List.of(
        new Activity(
            LocalDateTime.parse("2025-01-17T09:30"),
            Duration.parse("PT30M"),
            "ACME Inc.",
            "Foobar",
            "Do something"),
        new Activity(
            LocalDateTime.parse("2025-01-16T17:00"),
            Duration.parse("PT30M"),
            "ACME Inc.",
            "Foobar",
            "Do something"),
        new Activity(
            LocalDateTime.parse("2025-01-16T16:30"),
            Duration.parse("PT30M"),
            "ACME Inc.",
            "Foobar",
            "Do something"),
        new Activity(
            LocalDateTime.parse("2025-01-16T16:00"),
            Duration.parse("PT30M"),
            "ACME Inc.",
            "Foobar",
            "Make things",
            "This is a note"));
  }
}
