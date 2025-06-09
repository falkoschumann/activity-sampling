// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record WorkingDay(LocalDate date, List<Activity> activities) {}
