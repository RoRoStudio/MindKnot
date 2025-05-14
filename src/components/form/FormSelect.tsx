// src/components/form/FormSelect.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    SafeAreaView,
    Pressable,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Icon, IconName } from '../common/Icon';
import FormErrorMessage from './FormErrorMessage';

interface Option {
    label: string;
    value: string | number;
    icon?: IconName | string;
}

interface FormSelectProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    options: Option[];
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    placeholder?: string;
    helperText?: string;
    disabled?: boolean;
    onChange?: (value: any) => void;
}

export default function FormSelect<T extends FieldValues>({
    name,
    control,
    label,
    options,
    rules,
    placeholder = 'Select an option',
    helperText,
    disabled = false,
    onChange: onExternalChange,
}: FormSelectProps<T>) {
    const [modalVisible, setModalVisible] = useState(false);
    const selectedOptionRef = useRef<View>(null);

    const styles = useStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        selectContainer: {
            backgroundColor: theme.components.inputs.background,
            borderWidth: 1,
            borderColor: theme.components.inputs.border,
            borderRadius: theme.components.inputs.radius,
            padding: theme.spacing.m,
        },
        selectContainerError: {
            borderColor: theme.colors.error,
        },
        selectContainerDisabled: {
            opacity: 0.5,
        },
        selectContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        placeholder: {
            color: theme.components.inputs.placeholder,
        },
        selectedValue: {
            color: theme.components.inputs.text,
            flex: 1,
        },
        selectedValueWithIcon: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        selectedIcon: {
            marginRight: theme.spacing.s,
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
            maxHeight: '80%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        modalClose: {
            padding: theme.spacing.s,
        },
        optionItem: {
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        optionContent: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        optionIcon: {
            marginRight: theme.spacing.s,
        },
        selectedOption: {
            backgroundColor: theme.colors.surfaceVariant,
        },
        helperText: {
            marginTop: 4,
        },
    }));

    // Helper function to render an icon if present in the option
    const renderIcon = (iconName?: IconName | string, color?: string) => {
        if (!iconName) return null;
        
        return (
            <View style={styles.optionIcon}>
                <Icon 
                    name={iconName as IconName} 
                    width={20} 
                    height={20} 
                    color={color || styles.selectedValue.color}
                />
            </View>
        );
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                const selectedOption = options.find((option) => option.value === value);

                const openModal = () => {
                    if (!disabled) {
                        setModalVisible(true);
                    }
                };

                const closeModal = () => {
                    setModalVisible(false);
                };

                const handleSelect = (option: Option) => {
                    onChange(option.value);
                    if (onExternalChange) {
                        onExternalChange(option.value);
                    }
                    closeModal();
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
                                styles.selectContainer,
                                error && styles.selectContainerError,
                                disabled && styles.selectContainerDisabled,
                            ]}
                            onPress={openModal}
                            activeOpacity={disabled ? 1 : 0.7}
                            disabled={disabled}
                            ref={selectedOptionRef}
                        >
                            <View style={styles.selectContent}>
                                {selectedOption ? (
                                    <View style={styles.selectedValueWithIcon}>
                                        {renderIcon(selectedOption.icon)}
                                        <Typography style={styles.selectedValue}>
                                            {selectedOption.label}
                                        </Typography>
                                    </View>
                                ) : (
                                    <Typography style={styles.placeholder}>
                                        {placeholder}
                                    </Typography>
                                )}
                                <Icon
                                    name="chevron-down"
                                    width={16}
                                    height={16}
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
                            visible={modalVisible}
                            transparent
                            animationType="slide"
                            onRequestClose={closeModal}
                        >
                            <Pressable
                                style={styles.modalContainer}
                                onPress={closeModal}
                            >
                                <SafeAreaView
                                    style={styles.modalContent}
                                    onTouchStart={(e) => e.stopPropagation()}
                                >
                                    <View style={styles.modalHeader}>
                                        <Typography variant="h3">{label || 'Select an option'}</Typography>
                                        <TouchableOpacity
                                            style={styles.modalClose}
                                            onPress={closeModal}
                                        >
                                            <Icon
                                                name="x"
                                                width={20}
                                                height={20}
                                                color={styles.selectedValue.color}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <FlatList
                                        data={options}
                                        keyExtractor={(item) => item.value.toString()}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={[
                                                    styles.optionItem,
                                                    item.value === value && styles.selectedOption,
                                                ]}
                                                onPress={() => handleSelect(item)}
                                            >
                                                <View style={styles.optionContent}>
                                                    {renderIcon(item.icon)}
                                                    <Typography>{item.label}</Typography>
                                                </View>
                                                
                                                {item.value === value && (
                                                    <Icon
                                                        name="check"
                                                        width={20}
                                                        height={20}
                                                        color={styles.selectedValue.color}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    />
                                </SafeAreaView>
                            </Pressable>
                        </Modal>
                    </View>
                );
            }}
        />
    );
}