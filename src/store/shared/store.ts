// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import loopReducer from '../loops/loopSlice';
import pathReducer from '../paths/pathSlice';
import sagaReducer from '../sagas/sagaSlice';
import actionReducer from '../actions/actionSlice';
import noteReducer from '../notes/noteSlice';
import sparkReducer from '../sparks/sparkSlice';

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