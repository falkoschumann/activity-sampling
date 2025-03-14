// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.ui;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

// @Controller
public class HistoryApiController {

  @RequestMapping("/{path:[^.]*}")
  public String redirect(@PathVariable String path) {
    return "forward:/";
  }
}
