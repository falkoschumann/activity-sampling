// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain.activities;

import java.time.LocalDate;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record Holiday(LocalDate date, String title) {}
