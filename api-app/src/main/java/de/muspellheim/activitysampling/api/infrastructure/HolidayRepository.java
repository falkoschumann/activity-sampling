// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import de.muspellheim.activitysampling.api.domain.activities.Holiday;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface HolidayRepository {

  List<Holiday> findAllByDate(LocalDate startInclusive, LocalDate endExclusive);

  void save(Collection<Holiday> holidays);
}
