// src/components/loops/LoopFormSheet.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import FormBottomSheet from '../../components/common/FormBottomSheet';
import LoopForm from './LoopForm';
import { useSagas } from '../../hooks/useSagas';
import { useLoops } from '../../hooks/useLoops';

interface LoopFormSheetProps {
    visible: boolean;
    onClose: () => void;
    initialSagaId?: string;
    onSuccess?: () => void;
}

export default function LoopFormSheet({
    visible,
    onClose,
    initialSagaId,
    onSuccess
}: LoopFormSheetProps) {
    const { sagas } = useSagas();
    const { addLoop } = useLoops();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const success = await addLoop({
                ...data,
                frequency: typeof data.frequency === 'string' ? data.frequency : JSON.stringify(data.frequency)
            });

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the loop. Please try again.');
            }
        } catch (error) {
            console.error('Error creating loop:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormBottomSheet
            visible={visible}
            onClose={onClose}
            title="Create Loop"
            showSubmitButton={false} // Form has its own submit button
        >
            <LoopForm
                onSubmit={handleSubmit}
                sagas={sagas}
                initialData={{ sagaId: initialSagaId || '' }}
            />
        </FormBottomSheet>
    );
}