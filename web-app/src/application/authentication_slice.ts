// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { UserQuery, UserQueryResult } from "../domain/messages";
import { User } from "../domain/user";
import { UserApi } from "../infrastructure/user_api";

interface AuthenticationState {
  readonly isAuthenticated: boolean;
  readonly user?: User;
}

const initialState: AuthenticationState = {
  isAuthenticated: false,
};

type AuthenticationThunkConfig = {
  extra: {
    readonly userApi: UserApi;
  };
  state: { readonly authentication: AuthenticationState };
};

export const queryUser = createAsyncThunk<
  UserQueryResult,
  UserQuery,
  AuthenticationThunkConfig
>("activities/queryUser", async (_query, thunkAPI) => {
  const { userApi } = thunkAPI.extra;
  const user = await userApi.getUser();
  return { user };
});

const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(queryUser.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
    });
    builder.addCase(queryUser.rejected, (state, action) => {
      state.isAuthenticated = false;
      state.user = undefined;
      console.error("Failed to fetch user:", action.error);
    });
  },
  selectors: {
    selectAuthentication: (state: AuthenticationState) => state,
  },
});

export const { selectAuthentication } = authenticationSlice.selectors;

export default authenticationSlice.reducer;
