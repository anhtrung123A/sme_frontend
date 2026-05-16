import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getMeApi, loginApi, logoutApi } from './api'
import type { AuthUser, LoginRequest } from './types'
import {
  clearAuthSession,
  getAccessToken,
  getCurrentUser,
  getRefreshToken,
  setAccessToken,
  setCurrentUser,
  setRefreshToken,
} from '../../lib/auth'

type AuthState = {
  isAuthenticated: boolean
  isInitializing: boolean
  isSubmitting: boolean
  currentUser: AuthUser | null
  loginError: string | null
}

const initialState: AuthState = {
  isAuthenticated: Boolean(getAccessToken()),
  isInitializing: true,
  isSubmitting: false,
  currentUser: getCurrentUser(),
  loginError: null,
}

export const initializeAuth = createAsyncThunk('auth/initialize', async (_, { rejectWithValue }) => {
  const token = getAccessToken()
  if (!token) {
    clearAuthSession()
    return null
  }

  try {
    const user = await getMeApi()
    setCurrentUser(user)
    return user
  } catch (error) {
    clearAuthSession()
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize auth')
  }
})

export const loginWithPassword = createAsyncThunk<AuthUser, LoginRequest, { rejectValue: string }>(
  'auth/loginWithPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const tokens = await loginApi(payload)
      setAccessToken(tokens.accessToken)
      setRefreshToken(tokens.refreshToken)

      const me = await getMeApi()
      setCurrentUser(me)
      return me
    } catch (error) {
      clearAuthSession()
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed')
    }
  },
)

export const logout = createAsyncThunk('auth/logout', async () => {
  const refreshToken = getRefreshToken()

  try {
    await logoutApi(refreshToken)
  } catch {
    // Ignore API logout failures and clear local state anyway.
  } finally {
    clearAuthSession()
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearLoginError(state) {
      state.loginError = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      state.isInitializing = false
      state.currentUser = action.payload
      state.isAuthenticated = Boolean(action.payload)
    })

    builder.addCase(initializeAuth.rejected, (state) => {
      state.isInitializing = false
      state.currentUser = null
      state.isAuthenticated = false
    })

    builder.addCase(loginWithPassword.pending, (state) => {
      state.isSubmitting = true
      state.loginError = null
    })

    builder.addCase(loginWithPassword.fulfilled, (state, action) => {
      state.isSubmitting = false
      state.currentUser = action.payload
      state.isAuthenticated = true
      state.loginError = null
    })

    builder.addCase(loginWithPassword.rejected, (state, action) => {
      state.isSubmitting = false
      state.currentUser = null
      state.isAuthenticated = false
      state.loginError = action.payload ?? 'Login failed'
    })

    builder.addCase(logout.fulfilled, (state) => {
      state.currentUser = null
      state.isAuthenticated = false
      state.loginError = null
    })
  },
})

export const { clearLoginError } = authSlice.actions
export const authReducer = authSlice.reducer
