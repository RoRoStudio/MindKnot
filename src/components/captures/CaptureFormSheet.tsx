// src/components/captures/CaptureFormSheet.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity,
    Dimensions,
    Alert,
} from 'react-native';
import { BottomSheet } from '../common/BottomSheet';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { FormInput } from '../form';
import { Form } from '../form';
import { useForm } from 'react-hook-form';
import { CaptureSubType } from '../../types/capture';
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

type FormValues = {
    title: string;
};

export default function CaptureFormSheet({
    visible,
    onClose,
    initialSubType = CaptureSubType.NOTE,
    initialSagaId,
    onSuccess,
}: CaptureFormSheetProps) {
    const { theme } = useTheme();
    const { addCapture } = useCaptures();
    const { sagas } = useSagas();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { isValid },
        reset,
    } = useForm<FormValues>({
        defaultValues: {
            title: '',
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (visible) {
            reset({ title: '' });
            setIsSubmitting(false);
        }
    }, [visible]);

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
        formContainer: {
            width: '100%',
        },
        buttonContainer: {
            marginTop: theme.spacing.l,
            paddingBottom: 100,
        },
    }));

    const onSubmit = async (data: FormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const success = await addCapture({
                type: 'capture',
                subType: initialSubType,
                title: data.title.trim(),
                sagaId: initialSagaId || '',
            });

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the capture.');
            }
        } catch (error) {
            console.error('Capture save error:', error);
            Alert.alert('Error', 'Something went wrong.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ width: '100%' }}
                >
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Typography variant="h3">Create Capture</Typography>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                disabled={isSubmitting}
                            >
                                <Typography color="secondary">Cancel</Typography>
                            </TouchableOpacity>
                        </View>

                        <Form style={styles.formContainer}>
                            <FormInput
                                control={control}
                                name="title"
                                label="Title"
                                placeholder="Enter a title..."
                                rules={{ required: 'Title is required' }}
                                autoFocus
                            />

                            <View style={styles.buttonContainer}>
                                <Button
                                    label={isSubmitting ? 'Saving...' : 'Save Capture'}
                                    onPress={handleSubmit(onSubmit)}
                                    isLoading={isSubmitting}
                                    disabled={!isValid || isSubmitting}
                                />
                            </View>
                        </Form>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </BottomSheet>
    );
}
