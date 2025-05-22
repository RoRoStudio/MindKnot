// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import loopReducer from './slices/loopSlice';
import pathReducer from './slices/pathSlice';
import sagaReducer from './slices/sagaSlice';
import actionReducer from './slices/actionSlice';
import noteReducer from './slices/noteSlice';
import sparkReducer from './slices/sparkSlice';

export const store = configureStore({
    reducer: {
        loop: loopReducer,
        path: pathReducer,
        saga: sagaReducer,
        action: actionReducer,
        note: noteReducer,
        spark: sparkReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 