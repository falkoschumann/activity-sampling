// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import java.util.ArrayList;
import java.util.List;
import org.springframework.lang.NonNull;

public class MemoryActivitiesRepository extends AbstractActivitiesRepository {

  private final List<ActivityDto> activities = new ArrayList<>();

  @NonNull
  @Override
  @SuppressWarnings("unchecked")
  public <S extends ActivityDto> S save(@NonNull S entity) {
    if (entity.getId() != null) {
      for (var i = 0; i < activities.size(); i++) {
        var e = activities.get(i);
        if (entity.getId().equals(e.getId())) {
          activities.set(i, entity);
          return entity;
        }
      }
    }

    validateConstraint(entity);
    if (entity.getId() == null) {
      var newId =
          activities.stream()
              .map(ActivityDto::getId)
              .max(Long::compare)
              .map(id -> id + 1)
              .orElse(1L);
      entity = (S) entity.withId(newId);
    }

    activities.add(entity);
    return entity;
  }

  @NonNull
  @Override
  public List<ActivityDto> findAll() {
    return List.copyOf(activities);
  }

  @Override
  public void deleteById(@NonNull Long id) {
    activities.removeIf(e -> e.getId().equals(id));
  }
}
