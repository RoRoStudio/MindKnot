// src/components/loops/LoopFormSheet.tsx
import React, { useState } from 'react';
import { View, Alert, TouchableWithoutFeedback, Keyboard, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import LoopForm from './LoopForm';
import { useSagas } from '../../hooks/useSagas';
import { useLoops } from '../../hooks/useLoops';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    const { theme } = useTheme();
    const { sagas } = useSagas();
    const { addLoop } = useLoops();
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                            <Typography variant="h3">Create Loop</Typography>
                            <TouchableWithoutFeedback onPress={onClose}>
                                <View style={styles.closeButton}>
                                    <Typography color="secondary">Cancel</Typography>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style={styles.content}>
                            <LoopForm
                                onSubmit={handleSubmit}
                                sagas={sagas}
                                initialData={{ sagaId: initialSagaId || '' }}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </BottomSheet>
    );
}