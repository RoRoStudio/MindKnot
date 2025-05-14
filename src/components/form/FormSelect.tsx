import React, { useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
    Easing,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
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
    const [menuVisible, setMenuVisible] = useState(false);
    const [search, setSearch] = useState('');
    const animatedHeight = useRef(new Animated.Value(48)).current;

    const styles = useStyles((theme) => ({
        container: {
            width: '100%',
            marginBottom: theme.spacing.m,
        },
        dropdownWrapper: {
            borderWidth: 1,
            borderColor: theme.components.inputs.border,
            borderRadius: theme.components.inputs.radius,
            overflow: 'hidden',
            backgroundColor: theme.components.inputs.background,
        },
        header: {
            height: 48,
            paddingHorizontal: theme.spacing.m,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        inputText: {
            fontSize: 16,
        },
        placeholderText: {
            color: theme.components.inputs.placeholder,
            flex: 1,
        },
        selectedText: {
            color: theme.components.inputs.text,
            flex: 1,
        },
        searchInput: {
            padding: theme.spacing.s,
            fontSize: 16,
            color: theme.components.inputs.text,
            borderBottomWidth: 1,
            borderBottomColor: theme.components.inputs.border,
        },
        list: {
            maxHeight: 200,
        },
        option: {
            padding: theme.spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
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

    const renderIcon = (iconName?: IconName | string, color?: string) => {
        if (!iconName) return null;
        return (
            <View style={styles.optionIcon}>
                <Icon
                    name={iconName as IconName}
                    width={20}
                    height={20}
                    color={color || '#000'}
                />
            </View>
        );
    };

    const toggleDropdown = () => {
        if (disabled) return;
        const toValue = menuVisible ? 48 : 300;
        setMenuVisible(!menuVisible);
        Animated.timing(animatedHeight, {
            toValue,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                const selected = options.find(o => o.value === value);
                const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

                const handleSelect = (option: Option) => {
                    onChange(option.value);
                    if (onExternalChange) onExternalChange(option.value);
                    setMenuVisible(false);
                    Animated.timing(animatedHeight, {
                        toValue: 48,
                        duration: 200,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: false,
                    }).start();
                };

                return (
                    <KeyboardAvoidingView behavior="padding">
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.container}>
                                <Animated.View style={[styles.dropdownWrapper, { height: animatedHeight }]}>
                                    <TouchableOpacity
                                        style={styles.header}
                                        onPress={toggleDropdown}
                                        activeOpacity={0.8}
                                    >
                                        <Typography style={selected ? styles.selectedText : styles.placeholderText}>
                                            {selected ? selected.label : 'Select an entry type'}
                                        </Typography>
                                        <Icon name={menuVisible ? 'chevron-up' : 'chevron-down'} width={20} height={20} color="#000" />
                                    </TouchableOpacity>

                                    {menuVisible && (
                                        <>
                                            <TextInput
                                                placeholder="Search entries..."
                                                value={search}
                                                onChangeText={setSearch}
                                                style={styles.searchInput}
                                                placeholderTextColor={styles.placeholderText.color}
                                            />
                                            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                                                {filtered.map((option) => (
                                                    <TouchableOpacity
                                                        key={option.value.toString()}
                                                        style={[styles.option, option.value === value && styles.selectedOption]}
                                                        onPress={() => handleSelect(option)}
                                                    >
                                                        {renderIcon(option.icon)}
                                                        <Typography>{option.label}</Typography>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </>
                                    )}
                                </Animated.View>

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
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                );
            }}
        />
    );
}