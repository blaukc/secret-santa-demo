import { createSlice } from '@reduxjs/toolkit'

const axios = require('axios');

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        name: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))["first_name"] : '',
        email: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))["email"] : '',
    },
    reducers: {
        set_user_details: (state, action) => {
            state.name = action.payload.first_name
            state.email = action.payload.email
        },
        clear_user_details: (state) => {
            state.name = ''
            state.email = ''
        },
    },
})

// Action creators are generated for each case reducer function
const { set_user_details, clear_user_details } = userSlice.actions

export const get_user_details = (email, token) => async(dispatch) => {
    const response = await axios.get(`/api/usersByEmail/${email}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })

    dispatch(set_user_details(response.data))
    localStorage.setItem("user", JSON.stringify(response.data))
}

export const logout_user_details = () => dispatch => {
    dispatch(clear_user_details())
    localStorage.removeItem("user")
}

export default userSlice.reducer
