import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './slices/authSlice'
import { cdtSlice } from './slices/cdtSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        cdt: cdtSlice.reducer
    },
})