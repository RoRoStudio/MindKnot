// src/components/paths/PathFormSheet.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import FormBottomSheet from '../common/FormBottomSheet';
import PathForm from './PathForm';
import { useSagas } from '../../hooks/useSagas';
import { usePaths } from '../../hooks/usePaths';

interface PathFormSheetProps {
    visible: boolean;
    onClose: () => void;
    initialSagaId?: string;
    onSuccess?: () => void;
}

export default function PathFormSheet({
    visible,
    onClose,
    initialSagaId,
    onSuccess
}: PathFormSheetProps) {
    const { sagas } = useSagas();
    const { addPath } = usePaths();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const success = await addPath(data);

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the path. Please try again.');
            }
        } catch (error) {
            console.error('Error creating path:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormBottomSheet
            visible={visible}
            onClose={onClose}
            title="Create Path"
            showSubmitButton={false} // Form has its own submit button
        >
            <PathForm
                onSubmit={handleSubmit}
                sagas={sagas}
                initialData={{ sagaId: initialSagaId || '' }}
            />
        </FormBottomSheet>
    );
}