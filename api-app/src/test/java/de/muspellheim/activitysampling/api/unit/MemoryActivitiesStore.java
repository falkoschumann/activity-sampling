// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import de.muspellheim.activitysampling.api.infrastructure.ActivitiesStore;
import de.muspellheim.activitysampling.api.infrastructure.ActivityLoggedEvent;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

class MemoryActivitiesStore implements ActivitiesStore {

  private final List<ActivityLoggedEvent> events = new ArrayList<>();

  @Override
  public void record(ActivityLoggedEvent event) {
    events.add(event);
  }

  @Override
  public Stream<ActivityLoggedEvent> replay() {
    return events.stream();
  }
}
