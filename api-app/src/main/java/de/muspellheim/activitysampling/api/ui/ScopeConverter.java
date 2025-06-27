// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import de.muspellheim.activitysampling.api.domain.activities.Scope;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class ScopeConverter implements Converter<String, Scope> {

  @Override
  public Scope convert(String value) {
    return Scope.valueOf(value.toUpperCase());
  }
}
