import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios from "axios"

interface AuthState {
    loading: boolean,
    isAuthenticated: boolean,
    user: string | null,
    error: string | null 
}

const initialState: AuthState = {
    loading: false,
    isAuthenticated: false,
    user: null,
    error: null
}

// Thunk used for login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { username: string, password: string }, thunkAPI) => {
        try {
            const response = await axios.post('https://fh5oze841nf1.share.zrok.io/api/users/login', {
                username: credentials.username,
                password: credentials.password
            })

            if (response.status != 200) {
                throw new Error('Login failed')
            }
            localStorage.setItem('userToken', response.data.data.token)

            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue('Invalid username and password')
        }
    }
)

// Thunk used for register
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (credentials: { username: string, email: string, password: string, confirmPassword: string }, thunkAPI) => {
        try {
            const response = await axios.post('https://fh5oze841nf1.share.zrok.io/api/users', {
                name: credentials.username,
                email: credentials.email,
                username: credentials.username,
                password: credentials.password
            })

            if (response.status != 200) {
                throw new Error('Register failed')
            }

            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue('Invalid username and password')
        }
    }
)

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, thunkAPI) => {
        try {
            let userToken = localStorage.getItem('userToken');
            if (!userToken) {
                throw new Error('Token not found');
            }
            
            const response = await axios.delete('https://fh5oze841nf1.share.zrok.io/api/users/logout', {
                headers: {
                    Authorization: userToken,
                },
            })
            if (response.status != 200) {
                throw new Error('Logout failed')
            }

            localStorage.removeItem('userToken')
            return response.data
        } catch (error) {
            return thunkAPI.rejectWithValue('Logout failed')
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.isAuthenticated = true
            state.user = action.payload
            state.error = null
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false
            state.isAuthenticated = false
            state.user = null
            state.error = action.payload
        },
        logout: (state) => {
            state.loading = false
            state.isAuthenticated = false
            state.user = null
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false
            state.isAuthenticated = true
            state.user = action.payload.username
            state.error = null
        })
        builder.addCase(loginUser.rejected, (state, action) => {
            state.loading = false
            state.isAuthenticated = false
            state.error = action.payload as string
        })
        // Penanganan logoutUser
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.loading = false
            state.isAuthenticated = false
            state.user = null
            state.error = null
        })
        builder.addCase(logoutUser.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
    }
})

export const { loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer