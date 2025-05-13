// src/components/form/FormTextarea.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import FormErrorMessage from './FormErrorMessage';

interface FormTextareaProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    rules?: Omit
    RegisterOptions<T, Path<T>>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
        >;
showCharCount ?: boolean;
maxLength ?: number;
helperText ?: string;
numberOfLines ?: number;
autoGrow ?: boolean;
maxHeight ?: number;
}

export default function FormTextarea<T extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    rules,
    showCharCount,
    maxLength,
    helperText,
    numberOfLines = 4,
    autoGrow = true,
    maxHeight = 200,
}: FormTextareaProps<T>) {
    const [isFocused, setIsFocused] = useState(false);
    const [height, setHeight] = useState<number | undefined>(undefined);

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
            padding: theme.spacing.m,
            color: theme.components.inputs.text,
            fontSize: theme.typography.fontSize.m,
            textAlignVertical: 'top',
        },
        inputFocused: {
            borderColor: theme.components.inputs.focusBorder,
        },
        inputError: {
            borderColor: theme.colors.error,
        },
        charCounter: {
            alignSelf: 'flex-end',
            marginTop: 4,
        },
        helperText: {
            marginTop: 4,
        },
    }));

    const handleContentSizeChange = (event: any) => {
        if (autoGrow) {
            const contentHeight = event.nativeEvent.contentSize.height;
            setHeight(Math.min(contentHeight, maxHeight));
        }
    };

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
                            isFocused && styles.inputFocused,
                            error && styles.inputError,
                            height ? { height } : { minHeight: 20 * numberOfLines },
                        ]}
                        value={value}
                        onChangeText={(text) => {
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
                        placeholder={placeholder}
                        multiline
                        numberOfLines={numberOfLines}
                        onContentSizeChange={handleContentSizeChange}
                    />

                    {showCharCount && maxLength && (
                        <Typography
                            variant="caption"
                            style={styles.charCounter}
                            color={
                                value && typeof value === 'string' && value.length === maxLength
                                    ? 'error'
                                    : 'secondary'
                            }
                        >
                            {value && typeof value === 'string' ? value.length : 0}/{maxLength}
                        </Typography>
                    )}

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