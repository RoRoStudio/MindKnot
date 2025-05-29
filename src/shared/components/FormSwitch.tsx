// src/components/form/FormSwitch.tsx
import React from 'react';
import {
    View,
    Switch,
    StyleSheet,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Typography } from './Typography';
import { useTheme } from '../../app/contexts/ThemeContext';
import { FormErrorMessage } from './FormErrorMessage';

interface FormSwitchProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label: string;
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    helperText?: string;
    disabled?: boolean;
}

export default function FormSwitch<T extends FieldValues>({
    name,
    control,
    label,
    rules,
    helperText,
    disabled = false,
}: FormSwitchProps<T>) {
    const { theme } = useTheme();

    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        switchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        label: {
            flex: 1,
        },
        labelDisabled: {
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
                    <View style={styles.switchContainer}>
                        <Typography
                            style={[styles.label, disabled && styles.labelDisabled]}
                        >
                            {label}
                        </Typography>
                        <Switch
                            value={!!value}
                            onValueChange={(newValue) => {
                                onChange(newValue);
                                return;
                            }}
                            disabled={disabled}
                            trackColor={{
                                false: theme.colors.surfaceVariant,
                                true: theme.colors.primary,
                            }}
                            thumbColor={value ? theme.colors.primary : theme.colors.background}
                            ios_backgroundColor={theme.colors.surfaceVariant}
                        />
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