// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  AuthenticationQuery,
  AuthenticationQueryResult,
} from "../domain/messages";
import { User } from "../domain/user";
import { AuthenticationApi } from "../infrastructure/authentication_api";

interface AuthenticationState {
  readonly isAuthenticated: boolean;
  readonly user?: User;
}

const initialState: AuthenticationState = {
  isAuthenticated: false,
};

type AuthenticationThunkConfig = {
  extra: {
    readonly authentication: AuthenticationApi;
  };
  state: { readonly authentication: AuthenticationState };
};

export const queryAuthentication = createAsyncThunk<
  AuthenticationQueryResult,
  AuthenticationQuery,
  AuthenticationThunkConfig
>("activities/queryUser", async (_query, thunkAPI) => {
  const { authentication } = thunkAPI.extra;
  return authentication.queryAuthentication({});
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
      state.user = undefined;
    });
  },
  selectors: {
    selectAuthentication: (state: AuthenticationState) => state,
  },
});

export const { selectAuthentication } = authenticationSlice.selectors;

export default authenticationSlice.reducer;
