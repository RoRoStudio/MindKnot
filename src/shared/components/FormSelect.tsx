import React, { useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Modal,
    FlatList,
    Dimensions,
    Animated,
} from 'react-native';
import {
    Control,
    Controller,
    FieldValues,
    Path,
    RegisterOptions,
} from 'react-hook-form';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Typography } from './Typography';
import { Icon, IconName } from './Icon';
import FormErrorMessage from './FormErrorMessage';
import { useTheme } from '../../app/contexts/ThemeContext';

interface Option {
    label: string;
    value: string | number;
    icon?: IconName | string;
}

/**
 * FormSelect component for selecting an option from a dropdown
 */
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
    const { theme } = useTheme();
    const animation = useRef(new Animated.Value(0)).current;
    const windowHeight = Dimensions.get('window').height;

    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
            width: '100%',
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        selectContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.xl,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
            minHeight: 48,
            // Add subtle shadow
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        selectText: {
            flex: 1,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        placeholder: {
            color: theme.colors.textSecondary,
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: theme.colors.backdrop,
        },
        modalContent: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: theme.colors.surface,
            paddingBottom: 20,
            maxHeight: windowHeight * 0.5,
            // Add shadow to modal
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 5,
            elevation: 5,
        },
        modalHeader: {
            paddingVertical: theme.spacing.m,
            paddingHorizontal: theme.spacing.l,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
            marginBottom: theme.spacing.s,
        },
        modalTitle: {
            fontSize: theme.typography.fontSize.l,
            fontWeight: 'bold',
        },
        optionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.m,
            paddingHorizontal: theme.spacing.l,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        optionItemSelected: {
            backgroundColor: `${theme.colors.primary}15`,
        },
        optionItemText: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        optionItemTextSelected: {
            color: theme.colors.primary,
            fontWeight: '500',
        },
        iconContainer: {
            marginRight: theme.spacing.s,
        },
        icon: {
            width: 20,
            height: 20,
        },
        helperText: {
            marginTop: theme.spacing.xs,
        },
        disabled: {
            opacity: 0.5,
        },
    }));

    const renderIcon = (iconName?: IconName | string, color?: string) => {
        if (!iconName) return null;

        return (
            <View style={styles.iconContainer}>
                <Icon
                    name={iconName as IconName}
                    width={20}
                    height={20}
                    color={color || theme.colors.textPrimary}
                />
            </View>
        );
    };

    const toggleDropdown = () => {
        if (disabled) return;

        // Animate dropdown
        if (modalVisible) {
            // Close animation
            Animated.timing(animation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();

            setTimeout(() => setModalVisible(false), 200);
        } else {
            setModalVisible(true);

            // Open animation
            Animated.timing(animation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                const selectedOption = options.find(
                    (option) => option.value === value
                );

                const handleSelect = (option: Option) => {
                    onChange(option.value);
                    if (onExternalChange) {
                        onExternalChange(option.value);
                    }
                    toggleDropdown();
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
                                disabled && styles.disabled
                            ]}
                            onPress={toggleDropdown}
                            activeOpacity={0.7}
                            disabled={disabled}
                        >
                            {selectedOption?.icon && renderIcon(selectedOption.icon)}

                            <Typography
                                style={[
                                    styles.selectText,
                                    !selectedOption && styles.placeholder,
                                ]}
                            >
                                {selectedOption ? selectedOption.label : placeholder}
                            </Typography>

                            <Icon
                                name="chevron-down"
                                width={20}
                                height={20}
                                color={theme.colors.textSecondary}
                            />
                        </TouchableOpacity>

                        <Modal
                            visible={modalVisible}
                            transparent
                            animationType="none"
                            onRequestClose={toggleDropdown}
                        >
                            <Animated.View
                                style={[
                                    styles.modalContainer,
                                    {
                                        opacity: animation,
                                    },
                                ]}
                            >
                                <Animated.View
                                    style={[
                                        styles.modalContent,
                                        {
                                            transform: [
                                                {
                                                    translateY: animation.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [300, 0],
                                                    }),
                                                },
                                            ],
                                        },
                                    ]}
                                >
                                    <View style={styles.modalHeader}>
                                        <Typography style={styles.modalTitle}>
                                            {label || "Select an option"}
                                        </Typography>
                                    </View>

                                    <FlatList
                                        data={options}
                                        keyExtractor={(item) => item.value.toString()}
                                        renderItem={({ item }) => {
                                            const isSelected = value === item.value;

                                            return (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.optionItem,
                                                        isSelected && styles.optionItemSelected,
                                                    ]}
                                                    onPress={() => handleSelect(item)}
                                                >
                                                    {item.icon && renderIcon(
                                                        item.icon,
                                                        isSelected ? theme.colors.primary : undefined
                                                    )}

                                                    <Typography
                                                        style={[
                                                            styles.optionItemText,
                                                            isSelected && styles.optionItemTextSelected,
                                                        ]}
                                                    >
                                                        {item.label}
                                                    </Typography>

                                                    {isSelected && (
                                                        <Icon
                                                            name="check"
                                                            width={20}
                                                            height={20}
                                                            color={theme.colors.primary}
                                                            style={{ marginLeft: 'auto' }}
                                                        />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                </Animated.View>
                            </Animated.View>
                        </Modal>

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
}