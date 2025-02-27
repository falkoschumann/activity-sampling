package de.muspellheim.activitysampling.api.unit;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.springframework.data.repository.CrudRepository;
import org.springframework.lang.NonNull;

public abstract class CrudRepositoryStub<T, ID> extends ArrayList<T>
    implements CrudRepository<T, ID> {

  public CrudRepositoryStub() {}

  public CrudRepositoryStub(Collection<? extends T> entities) {
    super(entities);
  }

  protected abstract ID extractId(T entity);

  @Override
  @NonNull
  public <S extends T> S save(@NonNull S entity) {
    findById(extractId(entity))
        .ifPresentOrElse(
            a -> {
              var index = indexOf(a);
              set(index, entity);
            },
            () -> add(entity));
    return entity;
  }

  @Override
  @NonNull
  public <S extends T> Iterable<S> saveAll(@NonNull Iterable<S> entities) {
    entities.forEach(this::save);
    return entities;
  }

  @Override
  @NonNull
  public Optional<T> findById(@NonNull ID id) {
    return stream().filter(a -> extractId(a).equals(id)).findFirst();
  }

  @Override
  public boolean existsById(@NonNull ID id) {
    return findById(id).isPresent();
  }

  @Override
  @NonNull
  public Iterable<T> findAll() {
    return this;
  }

  @Override
  @NonNull
  public Iterable<T> findAllById(@NonNull Iterable<ID> ids) {
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
  public void deleteById(@NonNull ID id) {
    findById(id).ifPresent(this::delete);
  }

  @Override
  public void delete(@NonNull T entity) {
    remove(entity);
  }

  @Override
  public void deleteAllById(@NonNull Iterable<? extends ID> ids) {
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
