import { RootState } from '../store';
 
export const selectSelectedSagaId = (state: RootState) => state.saga.selectedSagaId; 