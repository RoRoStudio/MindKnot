// src/components/form/FormRadioGroup.tsx
import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import FormErrorMessage from './FormErrorMessage';

interface Option {
    label: string;
    value: string | number;
}

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
    const styles = useStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.s,
        },
        optionsContainer: {
            ...(row ? {
                flexDirection: 'row',
                flexWrap: 'wrap',
            } : {}),
        },
        optionContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
            ...(row ? {
                marginRight: theme.spacing.m,
                minWidth: 100,
            } : {}),
        },
        radio: {
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: theme.colors.primary,
            marginRight: theme.spacing.s,
            justifyContent: 'center',
            alignItems: 'center',
        },
        radioDisabled: {
            borderColor: theme.colors.textDisabled,
        },
        radioSelected: {
            borderWidth: 6,
        },
        optionLabel: {
            color: theme.colors.textPrimary,
        },
        optionLabelDisabled: {
            color: theme.colors.textDisabled,
        },
        helperText: {
            marginTop: 4,
        },
    }));

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    {label && (
                        <Typography variant="body1" style={styles.label}>
                            {label}
                        </Typography>
                    )}

                    <View style={styles.optionsContainer}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value.toString()}
                                style={styles.optionContainer}
                                onPress={() => {
                                    if (!disabled) {
                                        onChange(option.value);
                                    }
                                }}
                                activeOpacity={disabled ? 1 : 0.7}
                                disabled={disabled}
                            >
                                <View
                                    style={[
                                        styles.radio,
                                        value === option.value && styles.radioSelected,
                                        disabled && styles.radioDisabled,
                                    ]}
                                />
                                <Typography
                                    style={[
                                        styles.optionLabel,
                                        disabled && styles.optionLabelDisabled,
                                    ]}
                                >
                                    {option.label}
                                </Typography>
                            </TouchableOpacity>
                        ))}
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