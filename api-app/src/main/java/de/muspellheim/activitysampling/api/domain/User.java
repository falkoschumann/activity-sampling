// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.domain;

import java.util.List;

public record User(String name, List<String> roles) {}
