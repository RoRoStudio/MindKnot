import { useAppDispatch, useAppSelector } from './index';
import { setSelectedSaga } from '../slices/sagaSlice';
import { selectSelectedSagaId } from '../selectors/sagaSelectors';

// This hook mimics the previous Zustand API to make migration easier
export const useSagaActions = () => {
    const dispatch = useAppDispatch();
    const selectedSagaId = useAppSelector(selectSelectedSagaId);

    return {
        selectedSagaId,
        setSelectedSaga: (id: string | null) => dispatch(setSelectedSaga(id)),
    };
}; 