// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import de.muspellheim.activitysampling.api.util.MemoryCrudRepository;
import java.io.Serial;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;

@SuppressWarnings("PMD.AvoidDuplicateLiterals")
class MemoryCrudRepositoryTests {

  @Test
  void createsEmpty() {
    var repo = new MemoryCrudRepositoryImpl();

    assertEquals(List.of(), repo);
  }

  @Test
  void createsAndInitializeWithEntities() {
    var repo =
        new MemoryCrudRepositoryImpl(List.of(new EntityStub(1, "foo"), new EntityStub(2, "bar")));

    assertEquals(List.of(new EntityStub(1, "foo"), new EntityStub(2, "bar")), repo);
  }

  @Test
  void savesNewEntity() {
    var repo = new MemoryCrudRepositoryImpl();

    var saved = repo.save(new EntityStub("foo"));

    assertEquals(new EntityStub(1, "foo"), saved);
    assertEquals(List.of(new EntityStub(1, "foo")), repo);
  }

  @Test
  void savesExistingEntity() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));

    var saved = repo.save(new EntityStub(2, "baz"));

    assertEquals(new EntityStub(2, "baz"), saved);
    assertEquals(List.of(new EntityStub(1, "foo"), new EntityStub(2, "baz")), repo);
  }

  @Test
  void saveEntityWithConstraintViolation() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub("foo"));

    assertThrows(DuplicateKeyException.class, () -> repo.save(new EntityStub("foo")));
  }

  @Test
  void savesAllEntities() {
    var repo = new MemoryCrudRepositoryImpl();

    var saved = repo.saveAll(List.of(new EntityStub(1, "foo"), new EntityStub(2, "bar")));

    assertEquals(List.of(new EntityStub(1, "foo"), new EntityStub(2, "bar")), saved);
    assertEquals(List.of(new EntityStub(1, "foo"), new EntityStub(2, "bar")), repo);
  }

  @Test
  void findsByIdAnExistingEntity() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));

    var found = repo.findById(2);

    assertEquals(Optional.of(new EntityStub(2, "bar")), found);
  }

  @Test
  void findsByIdReturnsEmptyWhenEntityDoesNotExist() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));

    var found = repo.findById(3);

    assertEquals(Optional.empty(), found);
  }

  @Test
  void existsByIdReturnsTrueWhenEntityExist() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));

    var exists = repo.existsById(2);

    assertTrue(exists);
  }

  @Test
  void existsByIdReturnsFalseWhenEntityDoesNotExist() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));

    var exists = repo.existsById(3);

    assertFalse(exists);
  }

  @Test
  void findsAllEntities() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));

    var entities = repo.findAll();

    assertEquals(List.of(new EntityStub(1, "foo"), new EntityStub(2, "bar")), entities);
  }

  @Test
  void findsAllByIdReturnsEntitiesWithIds() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));
    repo.save(new EntityStub(3, "baz"));

    var entities = repo.findAllById(List.of(1, 2));

    assertEquals(List.of(new EntityStub(1, "foo"), new EntityStub(2, "bar")), entities);
  }

  @Test
  void countsEntities() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));

    var size = repo.count();

    assertEquals(2, size);
  }

  @Test
  void deletesById() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));

    repo.deleteById(1);

    assertEquals(List.of(new EntityStub(2, "bar")), repo);
  }

  @Test
  void deletesAnEntity() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));

    repo.delete(new EntityStub(1, "foo"));

    assertEquals(List.of(new EntityStub(2, "bar")), repo);
  }

  @Test
  void deletesAllById() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));
    repo.save(new EntityStub(3, "baz"));

    repo.deleteAllById(List.of(1, 2));

    assertEquals(List.of(new EntityStub(3, "baz")), repo);
  }

  @Test
  void deletesAllGivenEntities() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));
    repo.save(new EntityStub(3, "baz"));

    repo.deleteAll(List.of(new EntityStub(1, "foo"), new EntityStub(3, "baz")));

    assertEquals(List.of(new EntityStub(2, "bar")), repo);
  }

  @Test
  void deletesAllEntities() {
    var repo = new MemoryCrudRepositoryImpl();
    repo.save(new EntityStub(1, "foo"));
    repo.save(new EntityStub(2, "bar"));

    repo.deleteAll();

    assertEquals(List.of(), repo);
  }

  private static class MemoryCrudRepositoryImpl extends MemoryCrudRepository<EntityStub, Integer> {

    @Serial private static final long serialVersionUID = 1L;

    MemoryCrudRepositoryImpl() {}

    MemoryCrudRepositoryImpl(Collection<? extends EntityStub> entities) {
      super(entities);
    }

    @Override
    protected Integer getEntityId(EntityStub entity) {
      return entity.getId();
    }

    @Override
    protected void setEntityId(EntityStub entity, Integer id) {
      entity.setId(id);
    }

    @Override
    protected Integer nextId() {
      return size() + 1;
    }

    @Override
    protected <S extends EntityStub> void verifyConstraints(S entity) {
      stream()
          .filter(a -> a.getName().equals(entity.getName()))
          .findAny()
          .ifPresent(
              a -> {
                throw new DuplicateKeyException("Name must be unique.");
              });
    }
  }

  @Data
  @NoArgsConstructor
  @RequiredArgsConstructor
  @AllArgsConstructor
  private static class EntityStub {

    private Integer id;
    @NonNull private String name;
  }
}
