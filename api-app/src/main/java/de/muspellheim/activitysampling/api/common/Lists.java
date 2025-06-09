package de.muspellheim.activitysampling.api.common;

import java.util.List;
import java.util.function.Predicate;

public class Lists {

  public static <T> int indexOf(List<T> list, Predicate<T> predicate) {
    for (int i = 0; i < list.size(); i++) {
      if (predicate.test(list.get(i))) {
        return i;
      }
    }

    return -1;
  }

  private Lists() {}
}
