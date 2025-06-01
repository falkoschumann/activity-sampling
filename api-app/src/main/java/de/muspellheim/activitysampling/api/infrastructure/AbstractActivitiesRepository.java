// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.lang.NonNull;

public abstract class AbstractActivitiesRepository implements ActivitiesRepository {

  @Override
  public List<ActivityDto> findByTimestampGreaterThanEqualOrderByTimestampDesc(Instant start) {
    return findAll().stream()
        .filter(
            activity ->
                activity.getTimestamp().equals(start) || activity.getTimestamp().isAfter(start))
        .sorted(Comparator.comparing(ActivityDto::getTimestamp).reversed())
        .toList();
  }

  @NonNull
  @Override
  public <S extends ActivityDto> List<S> saveAll(Iterable<S> entities) {
    return StreamSupport.stream(entities.spliterator(), false).map(this::save).toList();
  }

  @NonNull
  @Override
  public Optional<ActivityDto> findById(@NonNull Long id) {
    return findAll().stream().filter(e -> e.getId().equals(id)).findFirst();
  }

  @Override
  public boolean existsById(@NonNull Long id) {
    return findById(id).isPresent();
  }

  @NonNull
  @Override
  public List<ActivityDto> findAllById(Iterable<Long> ids) {
    var idList = StreamSupport.stream(ids.spliterator(), false).toList();
    return findAll().stream().filter(e -> idList.contains(e.getId())).toList();
  }

  @Override
  public long count() {
    return findAll().size();
  }

  @Override
  public void delete(@NonNull ActivityDto entity) {
    deleteById(entity.getId());
  }

  @Override
  public void deleteAllById(Iterable<? extends Long> ids) {
    StreamSupport.stream(ids.spliterator(), false).forEach(this::deleteById);
  }

  @Override
  public void deleteAll(Iterable<? extends ActivityDto> entities) {
    entities.forEach(this::delete);
  }

  @Override
  public void deleteAll() {
    findAll().forEach(this::delete);
  }

  protected void validateConstraint(ActivityDto activity) {
    var activityWithSameTimestamp =
        findAll().stream()
            .filter(e -> e.getTimestamp().equals(activity.getTimestamp()))
            .findFirst();
    if (activityWithSameTimestamp.isPresent()) {
      throw new DataIntegrityViolationException("Duplicate timestamp: " + activity.getTimestamp());
    }
  }
}
