// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.infrastructure;

import java.time.temporal.Temporal;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record Event(Temporal dtStart, String summary) {}
