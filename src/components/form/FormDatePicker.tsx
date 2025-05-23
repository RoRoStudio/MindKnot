// src/components/form/FormDatePicker.tsx
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
    Control,
    Controller,
    FieldValues,
    Path,
    RegisterOptions,
} from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../shared/Typography';
import { Icon } from '../shared/Icon';
import FormErrorMessage from './FormErrorMessage';
import { useTheme } from '../../contexts/ThemeContext';

// Export interface for ref
export interface FormDatePickerRef {
    openPicker: () => void;
}

interface FormDatePickerProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    placeholder?: string;
    helperText?: string;
    disabled?: boolean;
    mode?: 'date' | 'time' | 'datetime';
    minimumDate?: Date;
    maximumDate?: Date;
    formatDate?: (date: Date) => string;
}

const FormDatePicker = forwardRef<FormDatePickerRef, FormDatePickerProps<any>>((props, ref) => {
    const {
        name,
        control,
        label,
        rules,
        placeholder = 'Select a date',
        helperText,
        disabled = false,
        mode = 'date',
        minimumDate,
        maximumDate,
        formatDate,
    } = props;

    const { theme } = useTheme();
    const [showPicker, setShowPicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Expose the openPicker method to parent components
    useImperativeHandle(ref, () => ({
        openPicker: () => {
            if (!disabled) {
                setShowPicker(true);
                setIsFocused(true);
            }
        }
    }));

    const styles = useStyles((theme) => ({
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
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 16,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
            minHeight: 48,
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
        inputText: {
            flex: 1,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        placeholder: {
            color: theme.colors.textSecondary,
        },
        iconContainer: {
            marginLeft: theme.spacing.s,
        },
        helperText: {
            marginTop: theme.spacing.xs,
        },
        disabled: {
            opacity: 0.5,
        },
    }));

    const defaultFormatDate = (date: Date) => {
        if (mode === 'time') {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (mode === 'datetime') {
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString();
    };

    const formatValue = (date: Date | null) => {
        if (!date) return '';
        return formatDate ? formatDate(date) : defaultFormatDate(date);
    };

    const getIconForMode = () => {
        switch (mode) {
            case 'time':
                return 'clock';
            case 'datetime':
                return 'calendar';
            case 'date':
            default:
                return 'calendar';
        }
    };

    const renderDatePicker = (value: Date | undefined, onChange: (date: Date) => void) => {
        if (!showPicker) return null;

        const handleChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
            setShowPicker(Platform.OS === 'ios');
            if (selectedDate) {
                onChange(selectedDate);
            }
        };

        return (
            <DateTimePicker
                value={value || new Date()}
                mode={mode}
                is24Hour={true}
                display="default"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
            />
        );
    };

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                // Convert string to Date if necessary
                let dateValue: Date | undefined;
                if (value) {
                    dateValue = typeof value === 'object' && 'getTime' in value ? value : new Date(value);
                }

                const openPicker = () => {
                    if (!disabled) {
                        setShowPicker(true);
                        setIsFocused(true);
                    }
                };

                return (
                    <View style={styles.container}>
                        {label && (
                            <Typography variant="body1" style={styles.label}>
                                {label}
                            </Typography>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.inputContainer,
                                isFocused && styles.inputContainerFocused,
                                error && styles.inputContainerError,
                                disabled && styles.disabled,
                            ]}
                            onPress={openPicker}
                            activeOpacity={0.7}
                            disabled={disabled}
                        >
                            <Typography
                                style={[
                                    styles.inputText,
                                    !dateValue && styles.placeholder,
                                ]}
                            >
                                {dateValue ? formatValue(dateValue) : placeholder}
                            </Typography>

                            <View style={styles.iconContainer}>
                                <Icon
                                    name={getIconForMode()}
                                    width={20}
                                    height={20}
                                    color={theme.colors.textSecondary}
                                />
                            </View>
                        </TouchableOpacity>

                        {renderDatePicker(dateValue, onChange)}

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
                );
            }}
        />
    );
});

export default FormDatePicker;