// src/components/form/FormInput.tsx
import React, { useState } from 'react';
import {
    View,
    TextInput,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import {
    Control,
    Controller,
    FieldValues,
    Path,
    RegisterOptions,
} from 'react-hook-form';
import { Typography } from '../Typography';
import { Icon } from '../Icon';
import { FormErrorMessage } from './FormErrorMessage';
import { useThemedStyles } from '../../hooks/useThemedStyles';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'onChange' | 'onBlur' | 'value'> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    showCharCount?: boolean;
    maxLength?: number;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    errorIcon?: boolean;
    leadingText?: string;
    /**
     * Whether this input is used as a title field
     * Title fields have no borders and the entire area is clickable
     * @default false
     */
    isTitle?: boolean;
}

interface LabelProps {
    label: string;
    style?: any;
}

export default function FormInput<T extends FieldValues>({
    name,
    control,
    label,
    rules,
    showCharCount,
    maxLength,
    helperText,
    leftIcon,
    rightIcon,
    errorIcon = true,
    leadingText,
    secureTextEntry,
    isTitle = false,
    ...inputProps
}: FormInputProps<T>) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
            width: '100%',
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isTitle ? 'transparent' : theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.xs,
            minHeight: 48,
            // Add subtle shadow for depth
            ...(isTitle ? {} : {
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
            }),
        },
        inputContainerFocused: {
            backgroundColor: isTitle ? 'transparent' : theme.colors.surfaceVariant,
            // Add more prominent shadow when focused
            ...(isTitle ? {} : {
                shadowColor: theme.colors.primary,
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 2,
            }),
        },
        inputContainerError: {
            backgroundColor: isTitle ? 'transparent' : `${theme.colors.error}10`,
        },
        input: {
            flex: 1,
            padding: theme.spacing.s,
            fontSize: isTitle ? theme.typography.fontSize.xl : theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            fontWeight: isTitle ? theme.typography.fontWeight.bold : theme.typography.fontWeight.regular,
            minHeight: isTitle ? 40 : 24, // Ensure minimum height
        },
        leadingText: {
            marginRight: theme.spacing.xs,
            color: theme.colors.textSecondary,
        },
        rightIconContainer: {
            paddingLeft: theme.spacing.xs,
        },
        leftIconContainer: {
            paddingRight: theme.spacing.xs,
        },
        charCount: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.xs,
        },
        helperText: {
            marginTop: theme.spacing.xxs,
            paddingHorizontal: theme.spacing.xs,
        },
    }));

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const renderPasswordIcon = () => {
        return (
            <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.rightIconContainer}
            >
                <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    width={20}
                    height={20}
                    color={styles.leadingText.color}
                />
            </TouchableOpacity>
        );
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    {label && !isTitle && (
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
                        {leftIcon && (
                            <View style={styles.leftIconContainer}>{leftIcon}</View>
                        )}

                        {leadingText && (
                            <Typography style={styles.leadingText}>
                                {leadingText}
                            </Typography>
                        )}

                        <TextInput
                            style={styles.input}
                            onChangeText={onChange}
                            onBlur={(e) => {
                                handleBlur();
                                onBlur();
                            }}
                            onFocus={handleFocus}
                            value={value === null || value === undefined ? '' : String(value)}
                            secureTextEntry={secureTextEntry && !showPassword}
                            maxLength={maxLength}
                            {...inputProps}
                        />

                        {secureTextEntry && renderPasswordIcon()}

                        {rightIcon && !secureTextEntry && (
                            <View style={styles.rightIconContainer}>{rightIcon}</View>
                        )}

                        {error && errorIcon && !secureTextEntry && !rightIcon && (
                            <View style={styles.rightIconContainer}>
                                <Icon
                                    name="circle-alert"
                                    width={20}
                                    height={20}
                                    color={styles.inputContainerError.backgroundColor}
                                />
                            </View>
                        )}

                        {showCharCount && maxLength && (
                            <Typography style={styles.charCount}>
                                {(value?.length || 0)}/{maxLength}
                            </Typography>
                        )}
                    </View>

                    {error && <FormErrorMessage message={error.message} />}

                    {helperText && !error && (
                        <Typography variant="caption" style={styles.helperText}>
                            {helperText}
                        </Typography>
                    )}
                </View>
            )}
        />
    );
}

// Label component for external use
FormInput.Label = function Label({ label, style }: LabelProps) {
    return (
        <Typography variant="body1" style={style}>
            {label}
        </Typography>
    );
};