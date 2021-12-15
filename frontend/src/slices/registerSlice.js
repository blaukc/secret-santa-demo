import { createSlice } from '@reduxjs/toolkit'
import { login } from './tokenSlice'

const axios = require('axios');

export const registerSlice = createSlice({
    name: 'register',
    initialState: {
        loading: false,
        error: '',
        error_code: ''
    },
    reducers: {
        register_request: (state) => {
            state.loading = true
            state.error = ''
            state.error_code = ''
        },
        register_success: (state) => {
            state.loading = false
        },
        register_fail: (state, action) => {
            state.error = action.payload.error
            state.error_code = action.payload.error_code
            state.loading = false
        },
    },
})

// Action creators are generated for each case reducer function
const { register_request, register_success, register_fail } = registerSlice.actions

export const register = (name, email, password) => async(dispatch) => {

    dispatch(register_request())

    try {
        await axios.post("/api/users/", {
            "first_name": name,
            "email": email,
            "password": password
        })

        dispatch(register_success())

        dispatch(login(email, password))

    } catch (error) {
        const error_message = error.response.data
        const error_code = error.message
        dispatch(register_fail({
            error: error_message,
            error_code: error_code
        }))
    }
}

export default registerSlice.reducer
