// src/components/form/FormDatePicker.tsx
import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Platform,
    Modal,
    SafeAreaView,
    Text,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Icon, Button } from '../common';
import FormErrorMessage from './FormErrorMessage';

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

export default function FormDatePicker<T extends FieldValues>({
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
}: FormDatePickerProps<T>) {
    const [showPicker, setShowPicker] = useState(false);

    const styles = useStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        pickerContainer: {
            backgroundColor: theme.components.inputs.background,
            borderWidth: 1,
            borderColor: theme.components.inputs.border,
            borderRadius: theme.components.inputs.radius,
            padding: theme.spacing.m,
        },
        pickerContainerError: {
            borderColor: theme.colors.error,
        },
        pickerContainerDisabled: {
            opacity: 0.5,
        },
        pickerContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        placeholder: {
            color: theme.components.inputs.placeholder,
        },
        selectedValue: {
            color: theme.components.inputs.text,
        },
        modalContainer: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: theme.shape.radius.l,
            borderTopRightRadius: theme.shape.radius.l,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        pickerWrapper: {
            padding: theme.spacing.m,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: theme.spacing.m,
        },
        helperText: {
            marginTop: 4,
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
            default:
                return 'calendar';
        }
    };

    // This is a simplified version that may need adjustment based on
    // how the DateTimePicker is configured in your project
    const renderDatePicker = (value: Date | undefined, onChange: (date: Date) => void) => {
        if (!showPicker) return null;

        const handleChange = (_: any, selectedDate?: Date) => {
            setShowPicker(Platform.OS === 'ios');
            if (selectedDate) {
                onChange(selectedDate);
            }
        };

        return (
            <DateTimePicker
                value={value || new Date()}
                mode={mode === 'datetime' ? 'date' : mode}
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
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                const openPicker = () => {
                    if (!disabled) {
                        setShowPicker(true);
                    }
                };

                const dateValue = value ? new Date(value) : undefined;

                return (
                    <View style={styles.container}>
                        {label && (
                            <Typography variant="body1" style={styles.label}>
                                {label}
                            </Typography>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.pickerContainer,
                                error && styles.pickerContainerError,
                                disabled && styles.pickerContainerDisabled,
                            ]}
                            onPress={openPicker}
                            activeOpacity={disabled ? 1 : 0.7}
                            disabled={disabled}
                        >
                            <View style={styles.pickerContent}>
                                <Typography
                                    style={dateValue ? styles.selectedValue : styles.placeholder}
                                >
                                    {dateValue ? formatValue(dateValue) : placeholder}
                                </Typography>
                                <Icon
                                    name={getIconForMode()}
                                    width={20}
                                    height={20}
                                    color={styles.selectedValue.color}
                                />
                            </View>
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

                        {/* Render DatePicker based on platform */}
                        {renderDatePicker(dateValue, onChange)}
                    </View>
                );
            }}
        />
    );
}