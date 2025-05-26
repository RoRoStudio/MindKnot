// src/components/form/FormTextarea.tsx
import React, { useState, useRef } from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Typography } from './Typography';
import FormErrorMessage from './FormErrorMessage';
import { useTheme } from '../../app/contexts/ThemeContext';

interface FormTextareaProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    showCharCount?: boolean;
    maxLength?: number;
    helperText?: string;
    numberOfLines?: number;
    autoGrow?: boolean;
    maxHeight?: number;
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
    const { theme } = useTheme();
    const [height, setHeight] = useState<number>(0);
    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<TextInput>(null);

    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
            width: '100%',
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        inputContainer: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.xl,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            minHeight: numberOfLines * 24, // Approximate line height
            // Add subtle shadow for depth
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        inputContainerFocused: {
            // Add more prominent shadow when focused
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 2,
        },
        inputContainerError: {
            backgroundColor: `${theme.colors.error}10`,
        },
        input: {
            padding: theme.spacing.m,
            minHeight: numberOfLines * 20,
            maxHeight: autoGrow ? maxHeight : undefined,
            textAlignVertical: 'top',
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        charCount: {
            alignSelf: 'flex-end',
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginRight: theme.spacing.s,
            marginTop: 4,
        },
        helperText: {
            marginTop: 4,
        },
    }));

    const handleContentSizeChange = (event: any) => {
        if (autoGrow) {
            let newHeight = event.nativeEvent.contentSize.height;
            if (maxHeight && newHeight > maxHeight) {
                newHeight = maxHeight;
            }
            setHeight(newHeight);
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

                    <View
                        style={[
                            styles.inputContainer,
                            isFocused && styles.inputContainerFocused,
                            error && styles.inputContainerError,
                        ]}
                    >
                        <TextInput
                            ref={inputRef}
                            style={[
                                styles.input,
                                autoGrow && height ? { height } : {}
                            ]}
                            value={value || ''}
                            onChangeText={onChange}
                            onBlur={() => {
                                setIsFocused(false);
                                onBlur();
                            }}
                            onFocus={() => setIsFocused(true)}
                            placeholder={placeholder}
                            placeholderTextColor={theme.colors.textSecondary}
                            multiline
                            numberOfLines={numberOfLines}
                            onContentSizeChange={handleContentSizeChange}
                            textAlignVertical="top"
                            selectionColor={theme.colors.primary}
                        />
                    </View>

                    {showCharCount && maxLength && (
                        <Typography style={styles.charCount}>
                            {value ? value.length : 0}/{maxLength}
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