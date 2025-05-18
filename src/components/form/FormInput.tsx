// src/components/form/FormInput.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Icon } from '../common';
import FormErrorMessage from './FormErrorMessage';

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
    const inputRef = useRef<TextInput>(null);

    const styles = useStyles((theme) => ({
        container: {
            marginBottom: isTitle ? theme.spacing.xs : theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.components.inputs.background,
            borderRadius: isTitle ? 0 : theme.components.inputs.radius,
            borderWidth: isTitle ? 0 : 1,
            borderColor: theme.components.inputs.border,
            overflow: 'hidden',
        },
        inputWrapperFocused: {
            borderColor: isTitle ? 'transparent' : theme.components.inputs.focusBorder,
        },
        inputWrapperError: {
            borderColor: isTitle ? 'transparent' : theme.colors.error,
        },
        leftIconContainer: {
            paddingLeft: theme.spacing.m,
        },
        rightIconContainer: {
            paddingRight: theme.spacing.m,
        },
        input: {
            flex: 1,
            padding: theme.spacing.m,
            color: theme.components.inputs.text,
            fontSize: isTitle ? theme.typography.fontSize.xl : theme.typography.fontSize.m,
            fontWeight: isTitle ? 'bold' : 'normal',
        },
        leadingText: {
            paddingLeft: theme.spacing.m,
            color: theme.components.inputs.text,
        },
        charCounter: {
            alignSelf: 'flex-end',
            marginTop: 4,
        },
        helperText: {
            marginTop: 4,
        },
    }));

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleFocus = () => {
        setIsFocused(true);
        inputRef.current?.focus();
    };

    const renderPasswordIcon = () => {
        if (!secureTextEntry) return null;

        return (
            <TouchableOpacity
                style={styles.rightIconContainer}
                onPress={togglePasswordVisibility}
                activeOpacity={0.7}
            >
                <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    width={20}
                    height={20}
                    color={styles.input.color}
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

                    <TouchableWithoutFeedback onPress={handleFocus}>
                        <View
                            style={[
                                styles.inputWrapper,
                                isFocused && styles.inputWrapperFocused,
                                error && styles.inputWrapperError,
                            ]}
                        >
                            {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
                            {leadingText && (
                                <Typography style={styles.leadingText}>{leadingText}</Typography>
                            )}

                            <TextInput
                                ref={inputRef}
                                style={styles.input}
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
                                secureTextEntry={secureTextEntry && !showPassword}
                                placeholder={isTitle ? 'Untitled' : inputProps.placeholder}
                                {...inputProps}
                            />

                            {renderPasswordIcon()}
                            {rightIcon && !secureTextEntry && (
                                <View style={styles.rightIconContainer}>{rightIcon}</View>
                            )}
                        </View>
                    </TouchableWithoutFeedback>

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

                    {!isTitle && (
                        <>
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
                        </>
                    )}
                </View>
            )}
        />
    );
}

// Static Label component to allow FormInput.Label usage
FormInput.Label = function Label({ label, style }: LabelProps) {
    const styles = useStyles((theme) => ({
        label: {
            marginBottom: theme.spacing.xs,
        }
    }));

    return (
        <Typography variant="body1" style={[styles.label, style]}>
            {label}
        </Typography>
    );
};