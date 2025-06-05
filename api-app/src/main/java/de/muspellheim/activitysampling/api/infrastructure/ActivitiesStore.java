// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import java.time.Instant;
import java.util.stream.Stream;

public interface ActivitiesStore {

  void record(ActivityLoggedEvent event);

  Stream<ActivityLoggedEvent> replay();

  default Stream<ActivityLoggedEvent> replay(Instant from) {
    return replay(from, Instant.MAX);
  }

  default Stream<ActivityLoggedEvent> replay(Instant from, Instant to) {
    return replay()
        .filter(it -> it.timestamp().equals(from) || it.timestamp().isAfter(from))
        .filter(it -> it.timestamp().isBefore(to));
  }
}
