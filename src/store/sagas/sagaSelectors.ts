import { RootState } from '../../store/shared/store';

export const selectSelectedSagaId = (state: RootState) => state.saga.selectedSagaId; 