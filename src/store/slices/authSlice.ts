import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    status: "not-authenticated",
    uid: null,
    email: null,
    displayName: null,
    role: null,
    errorMessage: null,
  },
  reducers: {
    register: (state, action) => {
      state.status = "authenticated";
      state.uid = action.payload.uid || null;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName || "Usuario";
      state.role = action.payload.role || "client";
      state.errorMessage = null;
    },
    logout: (state) => {
      state.status = "not-authenticated";
      state.uid = null;
      state.email = null;
      state.displayName = null;
      state.role = null;
      state.errorMessage = null;
    },
    checkingCredentials: (state) => {
      state.status = "checking";
    },
  },
});

export const { register, logout, checkingCredentials } = authSlice.actions;