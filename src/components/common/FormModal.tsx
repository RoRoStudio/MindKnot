import React from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Modal,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Typography } from './Typography';
import { Button } from './Button';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';

interface FormModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSubmit?: () => void;
    isSubmitting?: boolean;
    isEdit?: boolean;
    submitLabel?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
    visible,
    onClose,
    title,
    children,
    onSubmit,
    isSubmitting = false,
    isEdit = false,
    submitLabel = 'Save'
}) => {
    const { theme } = useTheme();

    const styles = useStyles((theme) => ({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContainer: {
            width: '90%',
            maxHeight: '90%',
            backgroundColor: theme.colors.background,
            borderRadius: theme.shape.radius.l,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        modalContent: {
            flex: 1,
            padding: theme.spacing.l,
        },
        modalFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: theme.spacing.l,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
        },
        closeButton: {
            padding: theme.spacing.s,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: theme.spacing.m,
        }
    }));

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.modalContainer}
                    >
                        <View style={styles.modalHeader}>
                            <Typography variant="h3">{title}</Typography>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                disabled={isSubmitting}
                            >
                                <Typography color="secondary">Cancel</Typography>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
                            {children}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <View style={styles.buttonContainer}>
                                <Button
                                    label={isSubmitting ? "Saving..." : submitLabel}
                                    variant="primary"
                                    onPress={onSubmit}
                                    isLoading={isSubmitting}
                                    disabled={isSubmitting}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}; 