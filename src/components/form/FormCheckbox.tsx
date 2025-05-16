// src/components/form/FormCheckbox.tsx
import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Icon } from '../common';
import FormErrorMessage from './FormErrorMessage';

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
    const styles = useStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        checkbox: {
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: theme.colors.primary,
            borderRadius: 4,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.s,
        },
        checkboxDisabled: {
            borderColor: theme.colors.textDisabled,
            opacity: 0.7,
        },
        checkboxChecked: {
            backgroundColor: theme.colors.primary,
        },
        label: {
            flex: 1,
        },
        labelDisabled: {
            color: theme.colors.textDisabled,
        },
        helperText: {
            marginTop: 4,
            marginLeft: 28, // Align with text
        },
    }));

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => {
                            if (!disabled) {
                                onChange(!value);
                            }
                        }}
                        activeOpacity={disabled ? 1 : 0.7}
                        disabled={disabled}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                value && styles.checkboxChecked,
                                disabled && styles.checkboxDisabled,
                            ]}
                        >
                            {value && (
                                <Icon
                                    name="check"
                                    width={16}
                                    height={16}
                                    color="#FFFFFF"
                                />
                            )}
                        </View>
                        <Typography
                            style={[styles.label, disabled && styles.labelDisabled]}
                        >
                            {label}
                        </Typography>
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