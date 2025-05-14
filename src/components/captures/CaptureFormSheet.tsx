// src/components/captures/CaptureFormSheet.tsx
import React, { useState, useEffect } from 'react';
import { View, Alert, TouchableWithoutFeedback, Keyboard, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import CaptureForm from './CaptureForm';
import { Capture, CaptureSubType } from '../../types/capture';
import { useSagas } from '../../hooks/useSagas';
import { useCaptures } from '../../hooks/useCaptures';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    const { theme } = useTheme();
    const { sagas } = useSagas();
    const { addCapture } = useCaptures();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captureType, setCaptureType] = useState<CaptureSubType>(initialSubType);

    // Reset capture type when props change
    useEffect(() => {
        setCaptureType(initialSubType);
    }, [initialSubType]);

    const styles = useStyles((theme) => ({
        container: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: theme.shape.radius.l,
            borderTopRightRadius: theme.shape.radius.l,
            paddingTop: theme.spacing.m,
            paddingHorizontal: theme.spacing.m,
            paddingBottom: theme.spacing.xl * 2,
            maxHeight: SCREEN_HEIGHT * 0.8,
            width: '100%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.m,
        },
        closeButton: {
            padding: theme.spacing.s,
        },
        content: {
            width: '100%',
        }
    }));

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

    // Dismiss keyboard when tapping outside input
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    if (!visible) return null;

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ width: '100%' }}
                >
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Typography variant="h3">{getFormTitle()}</Typography>
                            <TouchableWithoutFeedback onPress={onClose}>
                                <View style={styles.closeButton}>
                                    <Typography color="secondary">Cancel</Typography>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style={styles.content}>
                            <CaptureForm
                                onSubmit={handleSubmit}
                                sagas={sagas}
                                initialData={{
                                    subType: initialSubType,
                                    sagaId: initialSagaId || ''
                                }}
                                onCaptureTypeChange={handleCaptureTypeChange}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </BottomSheet>
    );
}