// src/components/paths/PathFormSheet.tsx
import React, { useState } from 'react';
import {
    View,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import PathForm from './PathForm';
import { useSagas } from '../../hooks/useSagas';
import { usePaths } from '../../hooks/usePaths';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    const { theme } = useTheme();
    const { sagas } = useSagas();
    const { addPath } = usePaths();
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
    }));

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

    if (!visible) return null;

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ width: '100%' }}
                >
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Typography variant="h3">Create Path</Typography>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                disabled={isSubmitting}
                            >
                                <Typography color="secondary">Cancel</Typography>
                            </TouchableOpacity>
                        </View>

                        <PathForm
                            onSubmit={handleSubmit}
                            sagas={sagas}
                            initialData={{ sagaId: initialSagaId || '' }}
                        />
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </BottomSheet>
    );
}
