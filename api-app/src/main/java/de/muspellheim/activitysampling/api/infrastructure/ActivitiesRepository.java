/* Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license. */

package de.muspellheim.activitysampling.api.infrastructure;

import java.time.Instant;
import java.util.List;
import org.springframework.data.repository.Repository;

public interface ActivitiesRepository extends Repository<ActivityDto, Instant> {

  List<ActivityDto> findByTimestampGreaterThanOrderByTimestampDesc(Instant start);
}
