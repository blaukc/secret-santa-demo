import { createSlice } from '@reduxjs/toolkit'
import { get_user_details, logout_user_details } from './userSlice'

const axios = require('axios');

export const tokenSlice = createSlice({
    name: 'token',
    initialState: {
        loading: false,
        error: '',
        access_token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token"))["access"] : '',
        refresh_token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token"))["refresh"] : '',
    },
    reducers: {
        login_request: (state) => {
            state.loading = true
            state.error = ''
        },
        login_success: (state, action) => {
            state.access_token = action.payload.access
            state.refresh_token = action.payload.refresh
            state.loading = false
        },
        login_fail: (state, action) => {
            state.access_token = ''
            state.refresh_token = ''
            state.error = action.payload
            state.loading = false
        },
        logout_success: (state) => {
            state.access_token = ''
            state.refresh_token = ''
        },
    },
})

// Action creators are generated for each case reducer function
const { login_request, login_success, login_fail, logout_success } = tokenSlice.actions

export const login = (email, password) => async(dispatch) => {

    dispatch(login_request())

    try {
        const response = await axios.post("/api/token/", {
            "username": email,
            "password": password
        })

        dispatch(login_success(response.data))
        localStorage.setItem("token", JSON.stringify(response.data))

        dispatch(get_user_details(email, response.data.access))

    } catch (error) {
        dispatch(login_fail(error.response.data.detail === undefined ? error.message : error.response.data.detail))
        localStorage.removeItem("token")
    }
}

export const logout = () => (dispatch) => {
    dispatch(logout_success())
    localStorage.removeItem("token")
    dispatch(logout_user_details())
}

export const validateToken = (token) => async(dispatch) => {
    try {
        await axios.get("/api/token/verify/", {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }})

    } catch (error) {
        dispatch(logout())
    }
}

export default tokenSlice.reducer
