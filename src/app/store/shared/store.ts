// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
// Import reducers from new feature structure
import actionReducer from '../../../features/actions/store/actionSlice';
import noteReducer from '../../../features/notes/store/noteSlice';
import pathReducer from '../../../features/paths/store/pathSlice';
import sagaReducer from '../../../features/sagas/store/sagaSlice';
import sparkReducer from '../../../features/sparks/store/sparkSlice';
// Loop reducers
import loopReducer from '../../../features/loops/store/loopSlice';
import executionReducer from '../../../features/loops/store/executionSlice';
import templateReducer from '../../../features/loops/store/templateSlice';
import builderReducer from '../../../features/loops/store/builderSlice';

export const store = configureStore({
    reducer: {
        action: actionReducer,
        note: noteReducer,
        path: pathReducer,
        saga: sagaReducer,
        spark: sparkReducer,
        // Loop feature reducers
        loops: loopReducer,
        execution: executionReducer,
        templates: templateReducer,
        builder: builderReducer,
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

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 