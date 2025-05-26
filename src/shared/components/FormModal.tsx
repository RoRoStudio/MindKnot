import React from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Modal,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Typography } from './Typography';
import { Button } from './Button';
import { useTheme } from '../../app/contexts/ThemeContext';
import { useStyles } from '../hooks/useStyles';

/**
 * Props for the FormModal component
 */
export interface FormModalProps {
    /**
     * Whether the modal is visible
     */
    visible: boolean;

    /**
     * Function to call when modal is closed
     */
    onClose: () => void;

    /**
     * Title for the modal header
     */
    title: string;

    /**
     * Form content to display in the modal
     */
    children: React.ReactNode;

    /**
     * Function to call when the form is submitted
     */
    onSubmit?: () => void;

    /**
     * Whether the form is currently submitting
     * @default false
     */
    isSubmitting?: boolean;

    /**
     * Whether this is an edit form (vs create)
     * @default false
     */
    isEdit?: boolean;

    /**
     * Custom label for the submit button
     * @default 'Save'
     */
    submitLabel?: string;
}

/**
 * FormModal component provides a modal dialog for form content
 * with standardized header, scrollable content area, and footer with submit button
 */
export const FormModal = React.memo<FormModalProps>(({
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
            backgroundColor: theme.colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
        },
        modalContainer: {
            width: '90%',
            maxHeight: '90%',
            backgroundColor: theme.colors.background,
            borderRadius: theme.shape.radius.l,
            elevation: 5,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            position: 'relative',
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
            width: '100%',
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
            statusBarTranslucent={true}
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
}); 