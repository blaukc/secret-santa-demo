import { configureStore } from '@reduxjs/toolkit'
import tokenReducer from './slices/tokenSlice'
import userReducer from './slices/userSlice'
import registerReducer from './slices/registerSlice'
import eventReducer from './slices/eventSlice'

export default configureStore({
    reducer: {
        token: tokenReducer,
        user: userReducer,
        register: registerReducer,
        event: eventReducer
    },
})
