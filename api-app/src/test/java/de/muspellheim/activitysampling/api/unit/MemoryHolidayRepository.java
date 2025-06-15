// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import de.muspellheim.activitysampling.api.domain.activities.Holiday;
import de.muspellheim.activitysampling.api.infrastructure.HolidayRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;

class MemoryHolidayRepository extends ArrayList<Holiday> implements HolidayRepository {

  @Override
  public List<Holiday> findAllByDate(LocalDate startInclusive, LocalDate endExclusive) {
    return stream()
        .filter(it -> !it.date().isBefore(startInclusive))
        .filter(it -> it.date().isBefore(endExclusive))
        .sorted(Comparator.comparing(Holiday::date))
        .toList();
  }

  @Override
  public void save(Collection<Holiday> holidays) {
    addAll(holidays);
  }
}
