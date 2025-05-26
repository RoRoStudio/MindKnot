import { RootState } from '../../../app/store';

export const selectSelectedSagaId = (state: RootState) => state.saga?.selectedSagaId || null; 