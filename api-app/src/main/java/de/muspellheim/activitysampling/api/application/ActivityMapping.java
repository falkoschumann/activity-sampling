// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.application;

import de.muspellheim.activitysampling.api.domain.activities.Activity;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import java.time.ZoneId;

class ActivityMapping {

  static Activity map(ActivityLoggedEvent event, ZoneId timeZone) {
    return Activity.builder()
        .dateTime(event.timestamp().atZone(timeZone).toLocalDateTime())
        .duration(event.duration())
        .client(event.client())
        .project(event.project())
        .task(event.task())
        .notes(event.notes())
        .build();
  }

  private ActivityMapping() {}
}
