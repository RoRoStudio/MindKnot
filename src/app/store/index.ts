// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import all feature slices
import actionSlice from '../../features/actions/store/actionSlice';
import noteSlice from '../../features/notes/store/noteSlice';
import pathSlice from '../../features/paths/store/pathSlice';
import sparkSlice from '../../features/sparks/store/sparkSlice';
import sagaSlice from '../../features/sagas/store/sagaSlice';
import loopSlice from '../../features/loops/store/loopSlice';

export const store = configureStore({
    reducer: {
        action: actionSlice,
        note: noteSlice,
        path: pathSlice,
        saga: sagaSlice,
        spark: sparkSlice,
        loops: loopSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 