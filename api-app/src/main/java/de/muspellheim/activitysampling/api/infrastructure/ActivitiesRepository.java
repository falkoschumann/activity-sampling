/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.infrastructure;

import java.time.Instant;
import java.util.List;
import org.springframework.data.repository.CrudRepository;

public interface ActivitiesRepository extends CrudRepository<ActivityDto, Instant> {

  List<ActivityDto> findByTimestampGreaterThanEqualOrderByTimestampDesc(Instant start);
}
