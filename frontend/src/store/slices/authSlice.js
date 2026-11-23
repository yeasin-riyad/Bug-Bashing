// src/store/slices/authSlice.js
// FIXED: BUG-AUTH-1 — added setUser reducer (used by Login.jsx)
// FIXED: BUG-AUTH-2 — normalize getMe payload (user object)
// FIXED: BUG-AUTH-5 — clear user/token on login failure
// FIXED: BUG-AUTH-7 — clear token only on 401/403 (not on network errors)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser, getMe } from "../../services/auth.api";
import { getToken, saveToken, clearToken } from "../../utils/auth";

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await loginUser(credentials);
      saveToken(res.data.token);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const registerAsync = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await registerUser(data);
      saveToken(res.data.token);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const getMeAsync = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No token");
      const res = await getMe();
      // FIXED: normalize — always return the user object
      return res.data?.user || res.data;
    } catch (err) {
      // FIXED: only clear token on real auth failures
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        clearToken();
      }
      return rejectWithValue(
        err.response?.data?.message || "Failed to load user"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: getToken() || null,
    loading: false,
    error: null,
    isAuthenticated: !!getToken(),
  },
  reducers: {
    // FIXED (BUG-AUTH-1): required by Login.jsx
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearToken();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // FIXED (BUG-AUTH-5): clear stale user/token
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // GetMe
      .addCase(getMeAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = getToken() || state.token; // FIXED: keep token synced
        state.isAuthenticated = true;
      })
      .addCase(getMeAsync.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;