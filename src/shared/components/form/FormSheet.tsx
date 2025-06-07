import React, { ReactNode } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
    Dimensions
} from 'react-native';
import { BottomSheet } from '../BottomSheet';
import { Typography } from '../Typography';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { useBottomSheetConfig } from '../../../app/contexts/BottomSheetConfig';
import { Button } from '../Button';

/**
 * Props for the FormSheet component
 */
export interface FormSheetProps {
    /**
     * Whether the form sheet is visible
     */
    visible: boolean;

    /**
     * Function to call when the sheet is closed
     */
    onClose: () => void;

    /**
     * Title for the form header
     */
    title: string;

    /**
     * Form content to display in the sheet
     */
    children: ReactNode;

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
     * Custom label for the submit button
     */
    submitLabel?: string;

    /**
     * Whether this is an edit form (vs create)
     * @default false
     */
    isEdit?: boolean;

    /**
     * Additional props to pass to the BottomSheet component
     * @default {}
     */
    bottomSheetProps?: Record<string, any>;

    /**
     * Additional style for the container
     */
    containerStyle?: StyleProp<ViewStyle>;

    /**
     * Additional style for the footer
     */
    footerStyle?: StyleProp<ViewStyle>;

    /**
     * Additional style for the header
     */
    headerStyle?: StyleProp<ViewStyle>;

    /**
     * Custom action button to replace the default submit button
     */
    actionButton?: ReactNode;
}

/**
 * FormSheet component provides a bottom sheet with form functionality
 * including standardized header, content area, and footer with submit button
 */
export const FormSheet = React.memo<FormSheetProps>(({
    visible,
    onClose,
    title,
    children,
    onSubmit,
    isSubmitting = false,
    submitLabel,
    isEdit = false,
    bottomSheetProps = {},
    containerStyle,
    footerStyle,
    headerStyle,
    actionButton,
}) => {
    const { theme } = useTheme();
    const { getConfig } = useBottomSheetConfig();
    const sheetConfig = getConfig(bottomSheetProps);

    const defaultSubmitLabel = isEdit ? 'Update' : 'Create';
    const actualSubmitLabel = submitLabel || defaultSubmitLabel;

    // Force maxHeight to a reasonable value to ensure content is visible
    // Default to 80% of screen height if not set
    const maxHeight = typeof sheetConfig.maxHeight === 'number'
        ? (sheetConfig.maxHeight <= 1 ? sheetConfig.maxHeight : sheetConfig.maxHeight)
        : 0.8; // 80% of screen height

    // Base styles
    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
            width: '100%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.m,
            paddingBottom: theme.spacing.s,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider || '#eee',
        },
        closeButton: {
            padding: theme.spacing.s,
        },
        footerContent: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
        },
        submitButton: {
            flex: 1,
        },
    });

    // Generate footer with submit button
    const renderFooter = () => {
        if (!onSubmit && !actionButton) return null;

        return (
            <View style={[styles.footerContent, footerStyle]}>
                {actionButton || (
                    <Button
                        style={styles.submitButton}
                        onPress={onSubmit}
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        variant="primary"
                        label={actualSubmitLabel}
                    />
                )}
            </View>
        );
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            footerContent={renderFooter()}
            animationDuration={sheetConfig.animationDuration}
            backdropOpacity={sheetConfig.backdropOpacity}
            minHeight={sheetConfig.minHeight}
            maxHeight={maxHeight}
            snapPoints={sheetConfig.snapPoints}
            showDragIndicator={sheetConfig.showDragIndicator}
            footerHeight={sheetConfig.footerHeight}
            dismissible={sheetConfig.dismissible}
            {...bottomSheetProps}
        >
            <View style={[styles.container, containerStyle]}>
                <View style={[styles.header, headerStyle]}>
                    <Typography variant="h3">{title}</Typography>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        disabled={isSubmitting}
                    >
                        <Typography color="secondary">Cancel</Typography>
                    </TouchableOpacity>
                </View>

                {children}
            </View>
        </BottomSheet>
    );
}); 