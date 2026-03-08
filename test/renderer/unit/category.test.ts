// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  init,
  reducer,
  setCategories,
  type State,
} from "../../../src/renderer/domain/category";

describe("Categories", () => {
  it("should ignore unknown action", () => {
    const initialState = init();

    // @ts-expect-error Testing unknown action handling
    const state = reducer(initialState, { type: "unknown_action" });

    expect(state).toBe(initialState);
  });

  describe("Initialize period", () => {
    it("should initialize with empty categories", () => {
      const state = init();

      expect(state).toEqual<State>({});
    });

    it("should initialize with categories", () => {
      const state = init({ categories: ["Feature", "Rework"] });

      expect(state).toEqual<State>({
        categories: ["Feature", "Rework"],
      });
    });
  });

  describe("Set categories", () => {
    it("should set categories", () => {
      const initialState = init({ categories: ["Feature", "Rework"] });

      const state = reducer(
        initialState,
        setCategories({
          categories: ["Feature", "Meeting", "Rework"],
        }),
      );

      expect(state.categories).toEqual(["Feature", "Meeting", "Rework"]);
    });
  });
});
