// src/hooks/useCaptures.ts
import { useState, useEffect, useCallback } from 'react';
import { Capture, CaptureSubType } from '../types/capture';
import { createCapture, getCapturesBySaga, getAllCaptures } from '../services/captureService';
import { useSagaStore } from '../state/sagaStore';

export function useCaptures() {
    const [captures, setCaptures] = useState<Capture[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const selectedSagaId = useSagaStore(state => state.selectedSagaId);

    const loadCaptures = useCallback(async (sagaId?: string) => {
        try {
            setLoading(true);
            setError(null);

            const targetSagaId = sagaId || selectedSagaId;
            if (targetSagaId) {
                const sagaCaptures = await getCapturesBySaga(targetSagaId);
                setCaptures(sagaCaptures);
            } else {
                // Load all captures when no saga is selected
                const allCaptures = await getAllCaptures();
                setCaptures(allCaptures);
            }
        } catch (err) {
            console.error('Failed to load captures:', err);
            setError('Failed to load captures');
        } finally {
            setLoading(false);
        }
    }, [selectedSagaId]);

    useEffect(() => {
        // Load captures when the component mounts, regardless of whether a saga is selected
        loadCaptures();
    }, [selectedSagaId, loadCaptures]);

    const addCapture = async (capture: Omit<Capture, 'id' | 'createdAt' | 'updatedAt' | 'chapterId'>) => {
        try {
            setLoading(true);
            setError(null);
            const newCapture = await createCapture(capture);

            // Update the state with the new capture
            setCaptures(prev => [newCapture, ...prev]);

            return true;
        } catch (err) {
            console.error('Failed to create capture:', err);
            setError('Failed to create capture');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Filter captures by subType
    const getCapturesByType = (subType: CaptureSubType) => {
        return captures.filter(capture => capture.subType === subType);
    };

    // Get captures due soon
    const getUpcomingCaptures = () => {
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        return captures.filter(capture => {
            if (capture.subType === CaptureSubType.ACTION && capture.dueDate && !capture.done) {
                const dueDate = new Date(capture.dueDate);
                return dueDate >= now && dueDate <= threeDaysFromNow;
            }
            return false;
        });
    };

    return {
        captures,
        loading,
        error,
        loadCaptures,
        addCapture,
        getCapturesByType,
        getUpcomingCaptures
    };
}