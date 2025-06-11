// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import java.time.Instant;
import java.util.stream.Stream;

public interface ActivitiesStore {

  void record(ActivityLoggedEvent event);

  Stream<ActivityLoggedEvent> replay();

  default Stream<ActivityLoggedEvent> replay(Instant startInclusive) {
    return replay(startInclusive, Instant.MAX);
  }

  default Stream<ActivityLoggedEvent> replay(Instant startInclusive, Instant endExclusive) {
    return replay()
        .filter(
            it -> it.timestamp().equals(startInclusive) || it.timestamp().isAfter(startInclusive))
        .filter(it -> it.timestamp().isBefore(endExclusive));
  }
}
