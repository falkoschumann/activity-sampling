// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type {
  AccountInfo,
  AuthenticationQuery,
  AuthenticationQueryResult,
} from "../domain/authentication";
import { AuthenticationApi } from "../infrastructure/authentication_api";

interface AuthenticationState {
  readonly isAuthenticated: boolean;
  readonly account?: AccountInfo;
}

const initialState: AuthenticationState = {
  isAuthenticated: false,
};

type AuthenticationThunkConfig = {
  extra: {
    readonly authenticationApi: AuthenticationApi;
  };
  state: { readonly authentication: AuthenticationState };
};

export const queryAuthentication = createAsyncThunk<
  AuthenticationQueryResult,
  AuthenticationQuery,
  AuthenticationThunkConfig
>("activities/queryUser", async (_query, thunkAPI) => {
  const { authenticationApi } = thunkAPI.extra;
  return authenticationApi.queryAuthentication({});
});

const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(queryAuthentication.fulfilled, (_state, action) => {
      return action.payload;
    });
    builder.addCase(queryAuthentication.rejected, (state) => {
      state.isAuthenticated = false;
      state.account = undefined;
    });
  },
  selectors: {
    selectAuthentication: (state: AuthenticationState) => state,
  },
});

export const { selectAuthentication } = authenticationSlice.selectors;

export default authenticationSlice.reducer;
