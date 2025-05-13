// src/components/form/FormDatePicker.tsx
import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Platform,
    StyleSheet,
    Modal,
    SafeAreaView,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import FormErrorMessage from './FormErrorMessage';

interface FormDatePickerProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    rules?: Omit
    RegisterOptions<T, Path<T>>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
        >;
placeholder ?: string;
helperText ?: string;
disabled ?: boolean;
mode ?: 'date' | 'time' | 'datetime';
minimumDate ?: Date;
maximumDate ?: Date;
formatDate ?: (date: Date) => string;
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

                const closePicker = () => {
                    setShowPicker(false);
                };

                const handleConfirm = (date: Date) => {
                    onChange(date);
                    closePicker();
                };

                const dateValue = value ? new Date(value) : null;

                if (Platform.OS === 'ios') {
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

                            <Modal
                                visible={showPicker}
                                transparent
                                animationType="slide"
                                onRequestClose={closePicker}
                            >
                                <View style={styles.modalContainer}>
                                    <SafeAreaView style={styles.modalContent}>
                                        <View style={styles.modalHeader}>
                                            <Typography variant="h3">
                                                {label || (mode === 'time' ? 'Select Time' : 'Select Date')}
                                            </Typography>
                                        </View>
                                        <View style={styles.pickerWrapper}>
                                            <DateTimePicker
                                                value={dateValue || new Date()}
                                                mode={mode === 'datetime' ? 'date' : mode}
                                                display="spinner"
                                                onChange={(_, selectedDate) => {
                                                    if (selectedDate) {
                                                        handleConfirm(selectedDate);
                                                    }
                                                }}
                                                minimumDate={minimumDate}
                                                maximumDate={maximumDate}
                                            />

                                            {mode === 'datetime' && (
                                                <DateTimePicker
                                                    value={dateValue || new Date()}
                                                    mode="time"
                                                    display="spinner"
                                                    onChange={(_, selectedDate) => {
                                                        if (selectedDate) {
                                                            handleConfirm(selectedDate);
                                                        }
                                                    }}
                                                />
                                            )}
                                        </View>
                                        <View style={styles.buttonContainer}>
                                            <Button
                                                variant="secondary"
                                                label="Cancel"
                                                onPress={closePicker}
                                            />
                                            <Button
                                                variant="primary"
                                                label="Confirm"
                                                onPress={() => handleConfirm(dateValue || new Date())}
                                            />
                                        </View>
                                    </SafeAreaView>
                                </View>
                            </Modal>
                        </View>
                    );
                }

                // Android implementation
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

                        {showPicker && (
                            <DateTimePicker
                                value={dateValue || new Date()}
                                mode={mode === 'datetime' ? 'date' : mode}
                                is24Hour={true}
                                display="default"
                                onChange={(_, selectedDate) => {
                                    setShowPicker(false);
                                    if (selectedDate) {
                                        if (mode === 'datetime') {
                                            // For datetime on Android, we need to handle this specially
                                            // First pick date, then time
                                            const currentDate = dateValue || new Date();
                                            currentDate.setFullYear(selectedDate.getFullYear());
                                            currentDate.setMonth(selectedDate.getMonth());
                                            currentDate.setDate(selectedDate.getDate());

                                            // Now show time picker
                                            setTimeout(() => {
                                                setShowPicker(true);
                                            }, 100);
                                        } else {
                                            onChange(selectedDate);
                                        }
                                    }
                                }}
                                minimumDate={minimumDate}
                                maximumDate={maximumDate}
                            />
                        )}
                    </View>
                );
            }}
        />
    );
}