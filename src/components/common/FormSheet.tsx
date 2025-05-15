import React, { ReactNode, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StyleProp,
    ViewStyle,
    Dimensions
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Typography } from './Typography';
import { useTheme } from '../../contexts/ThemeContext';
import { useBottomSheetConfig } from '../../contexts/BottomSheetConfig';
import { Button } from './Button';

export interface FormSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    onSubmit?: () => void;
    isSubmitting?: boolean;
    submitLabel?: string;
    isEdit?: boolean;
    bottomSheetProps?: Record<string, any>;
    containerStyle?: StyleProp<ViewStyle>;
    footerStyle?: StyleProp<ViewStyle>;
    headerStyle?: StyleProp<ViewStyle>;
    actionButton?: ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FormSheet: React.FC<FormSheetProps> = ({
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
}; 