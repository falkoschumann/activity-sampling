// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { FluxStandardActionAuto } from "flux-standard-action";

// region Actions and Action Creators

const SET_CATEGORIES_ACTION = "setCategories";

interface SetCategoriesPayload {
  categories: string[];
}

export function setCategories(
  payload: SetCategoriesPayload,
): FluxStandardActionAuto<typeof SET_CATEGORIES_ACTION, SetCategoriesPayload> {
  return { type: SET_CATEGORIES_ACTION, payload };
}

export type Action = ReturnType<typeof setCategories>;

// endregion
// region State

export interface State {
  readonly categories?: string[];
}

export function init({ categories }: { categories?: string[] } = {}): State {
  return {
    categories,
  };
}

// endregion
// region Reducer

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case SET_CATEGORIES_ACTION:
      return {
        ...state,
        categories: action.payload.categories,
      };
    default:
      return state;
  }
}

// endregion
