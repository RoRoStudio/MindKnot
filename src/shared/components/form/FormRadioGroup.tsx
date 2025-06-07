// src/components/form/FormRadioGroup.tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Typography } from '../Typography';
import { FormErrorMessage } from './FormErrorMessage';
import { useTheme } from '../../../app/contexts/ThemeContext';

interface Option {
    label: string;
    value: string | number;
}

/**
 * FormRadioGroup component for selecting a single option from a list of options
 */
interface FormRadioGroupProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    options: Option[];
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    helperText?: string;
    disabled?: boolean;
    row?: boolean;
}

export default function FormRadioGroup<T extends FieldValues>({
    name,
    control,
    label,
    options,
    rules,
    helperText,
    disabled = false,
    row = false,
}: FormRadioGroupProps<T>) {
    const { theme } = useTheme();

    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        optionsContainer: {
            flexDirection: row ? 'row' : 'column',
            flexWrap: row ? 'wrap' : 'nowrap',
        },
        optionContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
            marginRight: row ? theme.spacing.m : 0,
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.s,
            borderRadius: theme.shape.radius.l,
            backgroundColor: theme.colors.surfaceVariant,
            // Add subtle shadow
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        optionContainerSelected: {
            backgroundColor: `${theme.colors.primary}15`,
            // Enhanced shadow for selected state
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 2,
        },
        radio: {
            width: 20,
            height: 20,
            borderRadius: theme.shape.radius.m,
            borderWidth: 2,
            borderColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.s,
            backgroundColor: theme.colors.surface,
        },
        radioSelected: {
            borderColor: theme.colors.primary,
        },
        radioInner: {
            width: 10,
            height: 10,
            borderRadius: theme.shape.radius.s,
            backgroundColor: theme.colors.primary,
        },
        optionLabel: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        optionLabelSelected: {
            color: theme.colors.primary,
            fontWeight: '500',
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
                    {label && (
                        <Typography variant="body1" style={styles.label}>
                            {label}
                        </Typography>
                    )}

                    <View style={styles.optionsContainer}>
                        {options.map((option) => {
                            const isSelected = value === option.value;

                            return (
                                <TouchableOpacity
                                    key={option.value.toString()}
                                    style={[
                                        styles.optionContainer,
                                        isSelected && styles.optionContainerSelected,
                                        disabled && styles.disabled,
                                    ]}
                                    onPress={() => onChange(option.value)}
                                    disabled={disabled}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        style={[
                                            styles.radio,
                                            isSelected && styles.radioSelected,
                                        ]}
                                    >
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                    <Typography style={[
                                        styles.optionLabel,
                                        isSelected && styles.optionLabelSelected
                                    ]}>
                                        {option.label}
                                    </Typography>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

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