// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.util;

import java.io.Serial;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.springframework.data.repository.CrudRepository;
import org.springframework.lang.NonNull;

public abstract class MemoryCrudRepository<T, K> extends ArrayList<T>
    implements CrudRepository<T, K> {

  @Serial private static final long serialVersionUID = 1L;

  public MemoryCrudRepository() {}

  public MemoryCrudRepository(Collection<? extends T> entities) {
    super(entities);
  }

  protected abstract K getEntityId(T entity);

  protected abstract void setEntityId(T entity, K id);

  protected abstract K nextId();

  @Override
  @NonNull
  public <S extends T> S save(@NonNull S entity) {
    findById(getEntityId(entity))
        .ifPresentOrElse(a -> set(indexOf(a), entity), () -> add(merge(entity)));
    return entity;
  }

  private <S extends T> S merge(S entity) {
    var id = getEntityId(entity);
    if (id != null) {
      return entity;
    } else {
      setEntityId(entity, nextId());
      return entity;
    }
  }

  @Override
  @NonNull
  public <S extends T> Iterable<S> saveAll(@NonNull Iterable<S> entities) {
    entities.forEach(this::save);
    return entities;
  }

  @Override
  @NonNull
  public Optional<T> findById(@NonNull K id) {
    return stream().filter(a -> getEntityId(a).equals(id)).findFirst();
  }

  @Override
  public boolean existsById(@NonNull K id) {
    return findById(id).isPresent();
  }

  @Override
  @NonNull
  public Iterable<T> findAll() {
    return this;
  }

  @Override
  @NonNull
  public Iterable<T> findAllById(@NonNull Iterable<K> ids) {
    return StreamSupport.stream(ids.spliterator(), false)
        .map(this::findById)
        .filter(Optional::isPresent)
        .map(Optional::get)
        .toList();
  }

  @Override
  public long count() {
    return size();
  }

  @Override
  public void deleteById(@NonNull K id) {
    findById(id).ifPresent(this::delete);
  }

  @Override
  public void delete(@NonNull T entity) {
    remove(entity);
  }

  @Override
  public void deleteAllById(@NonNull Iterable<? extends K> ids) {
    ids.forEach(this::deleteById);
  }

  @Override
  public void deleteAll(@NonNull Iterable<? extends T> entities) {
    entities.forEach(this::delete);
  }

  @Override
  public void deleteAll() {
    clear();
  }
}
