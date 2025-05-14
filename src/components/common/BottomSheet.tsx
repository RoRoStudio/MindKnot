// src/components/common/FormBottomSheet.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    KeyboardAvoidingView,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from './Typography';
import { Button } from './Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    submitLabel?: string;
    onSubmit?: () => void;
    isSubmitting?: boolean;
    showSubmitButton?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FormBottomSheet: React.FC<FormBottomSheetProps> = ({
    visible,
    onClose,
    title,
    children,
    submitLabel = 'Save',
    onSubmit,
    isSubmitting = false,
    showSubmitButton = true,
}) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: theme.shape.radius.l,
            borderTopRightRadius: theme.shape.radius.l,
            maxHeight: SCREEN_HEIGHT * 0.9,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.m,
            paddingTop: theme.spacing.m,
            paddingBottom: theme.spacing.s,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        content: {
            padding: theme.spacing.xs,
            paddingBottom: insets.bottom || theme.spacing.m,
        },
        buttonContainer: {
            padding: theme.spacing.m,
            paddingBottom: Math.max(insets.bottom, theme.spacing.m),
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
        },
    }));

    // Handle keyboard events
    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setKeyboardVisible(true);
            }
        );
        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    // Dismiss keyboard when tapping outside input
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                    style={{ width: '100%' }}
                >
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Typography variant="h3">{title}</Typography>
                            <Button
                                variant="text"
                                label="Cancel"
                                onPress={onClose}
                                disabled={isSubmitting}
                            />
                        </View>

                        <View style={[
                            styles.content,
                            // Add extra padding at the bottom when keyboard is visible on Android
                            Platform.OS === 'android' && keyboardVisible && { paddingBottom: keyboardHeight }
                        ]}>
                            {children}
                        </View>

                        {showSubmitButton && (
                            <View style={styles.buttonContainer}>
                                <Button
                                    label={isSubmitting ? "Saving..." : submitLabel}
                                    variant="primary"
                                    onPress={onSubmit}
                                    disabled={isSubmitting}
                                    isLoading={isSubmitting}
                                    fullWidth
                                />
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </BottomSheet>
    );
};

export default FormBottomSheet;