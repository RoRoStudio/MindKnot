// src/components/captures/CaptureFormSheet.tsx
import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import FormBottomSheet from '../../components/common/FormBottomSheet';
import CaptureForm from './CaptureForm';
import { Capture, CaptureSubType } from '../../types/capture';
import { useSagas } from '../../hooks/useSagas';
import { useCaptures } from '../../hooks/useCaptures';

interface CaptureFormSheetProps {
    visible: boolean;
    onClose: () => void;
    initialSubType?: CaptureSubType;
    initialSagaId?: string;
    onSuccess?: () => void;
}

export default function CaptureFormSheet({
    visible,
    onClose,
    initialSubType = CaptureSubType.NOTE,
    initialSagaId,
    onSuccess
}: CaptureFormSheetProps) {
    const { sagas } = useSagas();
    const { addCapture } = useCaptures();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captureType, setCaptureType] = useState<CaptureSubType>(initialSubType);
    
    // Reset capture type when props change
    useEffect(() => {
        setCaptureType(initialSubType);
    }, [initialSubType]);

    const getFormTitle = (): string => {
        switch (captureType) {
            case CaptureSubType.NOTE:
                return 'Create Note';
            case CaptureSubType.SPARK:
                return 'Capture Insight';
            case CaptureSubType.ACTION:
                return 'Add Action';
            case CaptureSubType.REFLECTION:
                return 'New Reflection';
            default:
                return 'New Capture';
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const success = await addCapture({
                type: 'capture',
                ...data,
            });

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the capture. Please try again.');
            }
        } catch (error) {
            console.error('Error creating capture:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCaptureTypeChange = (type: CaptureSubType) => {
        setCaptureType(type);
    };

    return (
        <FormBottomSheet
            visible={visible}
            onClose={onClose}
            title={getFormTitle()}
            showSubmitButton={false} // Form has its own submit button
        >
            <CaptureForm
                onSubmit={handleSubmit}
                sagas={sagas}
                initialData={{
                    subType: initialSubType,
                    sagaId: initialSagaId || ''
                }}
                onCaptureTypeChange={handleCaptureTypeChange}
            />
        </FormBottomSheet>
    );
}