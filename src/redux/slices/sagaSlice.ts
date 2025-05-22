import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SagaState {
    selectedSagaId: string | null;
}

const initialState: SagaState = {
    selectedSagaId: null,
};

export const sagaSlice = createSlice({
    name: 'saga',
    initialState,
    reducers: {
        setSelectedSaga: (state, action: PayloadAction<string | null>) => {
            state.selectedSagaId = action.payload;
        },
    },
});

export const { setSelectedSaga } = sagaSlice.actions;

export default sagaSlice.reducer; 