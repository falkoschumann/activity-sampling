// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

package de.muspellheim.activitysampling.api.unit;

import static org.junit.jupiter.api.Assertions.assertEquals;

import de.muspellheim.activitysampling.api.common.Lists;
import java.util.List;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class ListsTests {

  @Nested
  class IndexOf {

    @Test
    void returnsNoneWhenListIsEmpty() {
      var list = List.<String>of();

      var index = Lists.indexOf(list, v -> v.startsWith("a"));

      assertEquals(-1, index);
    }

    @Test
    void returnsIndexWhenItemIsFound() {
      var list = List.of("foo", "bar");

      var index = Lists.indexOf(list, v -> v.startsWith("b"));

      assertEquals(1, index);
    }

    @Test
    void returnsNoneWhenItemIsNotFound() {
      var list = List.of("foo", "bar");

      var index = Lists.indexOf(list, v -> v.startsWith("a"));

      assertEquals(-1, index);
    }
  }
}
