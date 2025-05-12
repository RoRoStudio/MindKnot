// src/components/common/FormInput.tsx
import React, { useState } from 'react';
import {
    View,
    TextInput,
    TextInputProps,
    StyleSheet
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from './Typography';
import { Control, Controller, FieldValues, Path, RegisterOptions, FieldPath } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> extends TextInputProps {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    showCharCount?: boolean;
    maxLength?: number;
    message?: string;
}

function FormInput<T extends FieldValues>({
    name,
    control,
    label,
    rules,
    showCharCount,
    maxLength,
    message,
    ...inputProps
}: FormInputProps<T>) {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const styles = useStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        input: {
            backgroundColor: theme.components.inputs.background,
            borderWidth: 1,
            borderColor: theme.components.inputs.border,
            borderRadius: theme.components.inputs.radius,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
            color: theme.components.inputs.text,
            fontSize: theme.typography.fontSize.m,
        },
        focusedInput: {
            borderColor: theme.components.inputs.focusBorder,
        },
        errorInput: {
            borderColor: theme.colors.error,
        },
        charCounter: {
            alignSelf: 'flex-end',
            marginTop: 4,
        },
        errorText: {
            color: theme.colors.error,
            marginTop: 4,
        },
        messageText: {
            marginTop: 4,
        },
    }));

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    {label && (
                        <Typography variant="body1" style={styles.label}>
                            {label}
                        </Typography>
                    )}

                    <TextInput
                        style={[
                            styles.input,
                            isFocused && styles.focusedInput,
                            error && styles.errorInput,
                        ]}
                        value={value}
                        onChangeText={text => {
                            if (maxLength && text.length > maxLength) {
                                return;
                            }
                            onChange(text);
                        }}
                        onBlur={() => {
                            setIsFocused(false);
                            onBlur();
                        }}
                        onFocus={() => setIsFocused(true)}
                        maxLength={maxLength}
                        placeholderTextColor={theme.components.inputs.placeholder}
                        {...inputProps}
                    />

                    {showCharCount && maxLength && (
                        <Typography
                            variant="caption"
                            style={styles.charCounter}
                            color={value?.length === maxLength ? 'error' : 'secondary'}
                        >
                            {value?.length || 0}/{maxLength}
                        </Typography>
                    )}

                    {error ? (
                        <Typography variant="caption" style={styles.errorText}>
                            {error.message}
                        </Typography>
                    ) : message ? (
                        <Typography variant="caption" style={styles.messageText} color="secondary">
                            {message}
                        </Typography>
                    ) : null}
                </View>
            )}
        />
    );
}

export default FormInput;