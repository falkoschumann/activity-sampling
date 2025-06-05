// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import java.time.Instant;
import java.util.stream.Stream;
import org.springframework.stereotype.Component;

@Component
public class JpaActivitiesStore implements ActivitiesStore {

  private final ActivitiesRepository repository;

  public JpaActivitiesStore(ActivitiesRepository repository) {
    this.repository = repository;
  }

  @Override
  public void record(ActivityLoggedEvent event) {
    var dto =
        ActivityDto.builder()
            .timestamp(event.timestamp())
            .duration(event.duration())
            .client(event.client())
            .project(event.project())
            .task(event.task())
            .notes(event.notes())
            .build();
    repository.save(dto);
  }

  @Override
  public Stream<ActivityLoggedEvent> replay() {
    return replay(Instant.MIN, Instant.MAX);
  }

  @Override
  public Stream<ActivityLoggedEvent> replay(Instant from) {
    return replay(from, Instant.MAX);
  }

  @Override
  public Stream<ActivityLoggedEvent> replay(Instant from, Instant to) {
    return repository.findByTimestampGreaterThanEqualAndTimestampBefore(from, to).stream()
        .map(
            it ->
                ActivityLoggedEvent.builder()
                    .timestamp(it.getTimestamp())
                    .duration(it.getDuration())
                    .client(it.getClient())
                    .project(it.getProject())
                    .task(it.getTask())
                    .notes(it.getNotes())
                    .build());
  }
}
