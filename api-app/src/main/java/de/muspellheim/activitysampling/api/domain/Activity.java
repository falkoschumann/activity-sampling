/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.domain;

import java.time.Duration;
import java.time.LocalDateTime;

public record Activity(
    LocalDateTime timestamp,
    Duration duration,
    String client,
    String project,
    String task,
    String notes) {

  public Activity(
      LocalDateTime timestamp, Duration duration, String client, String project, String task) {
    this(timestamp, duration, client, project, task, "");
  }
}
