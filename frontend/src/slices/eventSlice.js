import { createSlice } from '@reduxjs/toolkit'
import { logout } from '../slices/tokenSlice'

const axios = require('axios');

export const eventSlice = createSlice({
    name: 'create_event',
    initialState: {
        create_loading: false,
        create_error: '',
        create_error_code: '',
        created: false,
        update_loading: false,
        update_error: '',
        update_error_code: '',
        sending_emails_loading: false,
        sending_emails_error: '',
        sending_emails_code: '',
    },
    reducers: {
        create_event_request: (state) => {
            state.create_loading = true
            state.create_error = ''
            state.create_error_code = ''
        },
        create_event_success: (state) => {
            state.create_loading = false
            state.created = true
        },
        create_event_fail: (state, action) => {
            state.create_error = action.payload.error
            state.create_error_code = action.payload.error_code
            state.create_loading = false
            state.created = false
        },
        create_event_redirected: (state) => {
            state.created = false
        },
        update_event_request: (state) => {
            state.update_loading = true
            state.update_error_code = ''
            state.update_error = ''
        },
        update_event_success: (state) => {
            state.update_loading = false
        },
        update_event_fail: (state, action) => {
            state.update_error = action.payload.error
            state.update_error_code = action.payload.error_code
            state.update_loading = false
        },
        sending_emails_request: (state) => {
            state.sending_emails_loading = true
            state.sending_emails_error_code = ''
            state.sending_emails_error = ''
        },
        sending_emails_success: (state) => {
            state.sending_emails_loading = false
        },
        sending_emails_fail: (state, action) => {
            state.sending_emails_error = action.payload.error
            state.sending_emails_error_code = action.payload.error_code
            state.sending_emails_loading = false
        },
    },
})

// Action creators are generated for each case reducer function
const { create_event_request, create_event_success, create_event_fail } = eventSlice.actions

export const  { create_event_redirected } = eventSlice.actions

export const create_event = (token, eventInfo) => async(dispatch) => {

    dispatch(create_event_request())

    try {
        await axios.post("/api/events/", eventInfo, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }})

        dispatch(create_event_success())

    } catch (error) {
        const error_message = error.response.data
        const error_code = error.message
        if (error.response.status === 401) {
            dispatch(logout())
        } else {
            dispatch(create_event_fail({
                error: error_message,
                error_code: error_code
            }))
        }
    }
}

const { update_event_request, update_event_success, update_event_fail } = eventSlice.actions

export const update_event = (token, eventInfo, slug) => async(dispatch) => {

    dispatch(update_event_request())

    try {
        await axios.put(`/api/events/${slug}/`, eventInfo, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }})

        dispatch(update_event_success())

    } catch (error) {
        const error_message = error.response.data
        const error_code = error.message
        if (error.response.status === 401) {
            dispatch(logout())
        } else {
            dispatch(update_event_fail({
                error: error_message,
                error_code: error_code
            }))
        }
    }
}

export const delete_event = (token, slug) => async(dispatch) => {

    try {
        await axios.delete(`/api/events/${slug}/`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }})

    } catch (error) {
        if (error.response.status === 401) {
            dispatch(logout())
        }
    }
}



const { sending_emails_request, sending_emails_success, sending_emails_fail } = eventSlice.actions

export const sending_emails = (token, subject, body, slug) => async(dispatch) => {

    dispatch(sending_emails_request())

    try {
        const response = await axios.post(`/api/draw-names/${slug}/`, {
            'subject': subject,
            'body': body
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        dispatch(sending_emails_success())

        return response

    } catch (error) {
        const error_message = error.response.data
        const error_code = error.message
        if (error.response.status === 401) {
            dispatch(logout())
        } else {
            dispatch(sending_emails_fail({
                error: error_message,
                error_code: error_code
            }))
        }

    }
}

export default eventSlice.reducer
