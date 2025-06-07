// src/components/form/FormCheckbox.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Typography } from '../Typography';
import { Icon } from '../Icon';
import { FormErrorMessage } from './FormErrorMessage';
import { useTheme } from '../../../app/contexts/ThemeContext';

/**
 * FormCheckbox component for boolean input
 */
interface FormCheckboxProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label: string;
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    helperText?: string;
    disabled?: boolean;
}

export default function FormCheckbox<T extends FieldValues>({
    name,
    control,
    label,
    rules,
    helperText,
    disabled = false,
}: FormCheckboxProps<T>) {
    const { theme } = useTheme();

    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.l,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
            // Add subtle shadow
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        checkbox: {
            width: 22,
            height: 22,
            borderRadius: theme.shape.radius.s,
            borderWidth: 2,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.s,
        },
        checkboxChecked: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        label: {
            flex: 1,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        disabled: {
            opacity: 0.5,
        },
        helperText: {
            marginTop: theme.spacing.xs,
        },
    }));

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    <TouchableOpacity
                        style={[
                            styles.checkboxContainer,
                            disabled && styles.disabled
                        ]}
                        onPress={() => {
                            if (!disabled) {
                                onChange(!value);
                            }
                        }}
                        activeOpacity={0.7}
                        disabled={disabled}
                    >
                        <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                            {value && (
                                <Icon
                                    name="check"
                                    width={14}
                                    height={14}
                                    color={theme.colors.surface}
                                />
                            )}
                        </View>
                        <Typography style={styles.label}>{label}</Typography>
                    </TouchableOpacity>

                    <FormErrorMessage message={error?.message} visible={!!error} />

                    {helperText && !error && (
                        <Typography
                            variant="caption"
                            style={styles.helperText}
                            color="secondary"
                        >
                            {helperText}
                        </Typography>
                    )}
                </View>
            )}
        />
    );
}