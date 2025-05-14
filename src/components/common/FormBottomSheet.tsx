// src/components/common/FormBottomSheet.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Typography } from './Typography';
import { Button } from './Button';
import { useStyles } from '../../hooks/useStyles';

interface FormBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    showSubmitButton?: boolean;
    submitText?: string;
    onSubmit?: () => void;
    isSubmitting?: boolean;
}

const FormBottomSheet: React.FC<FormBottomSheetProps> = ({
    visible,
    onClose,
    title,
    children,
    showSubmitButton = true,
    submitText = 'Submit',
    onSubmit,
    isSubmitting = false
}) => {
    const styles = useStyles((theme) => ({
        header: {
            marginBottom: theme.spacing.m,
        },
        title: {
            marginBottom: theme.spacing.xs,
        },
        footer: {
            marginTop: theme.spacing.l,
        }
    }));

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <View style={styles.header}>
                <Typography variant="h3" style={styles.title}>{title}</Typography>
            </View>
            
            {children}
            
            {showSubmitButton && onSubmit && (
                <View style={styles.footer}>
                    <Button
                        label={submitText}
                        variant="primary"
                        onPress={onSubmit}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                    />
                </View>
            )}
        </BottomSheet>
    );
};

export default FormBottomSheet;