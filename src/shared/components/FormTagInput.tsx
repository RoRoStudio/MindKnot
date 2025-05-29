import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import {
    Control,
    Controller,
    FieldValues,
    Path,
    RegisterOptions,
} from 'react-hook-form';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { FormErrorMessage } from './FormErrorMessage';
import { useTheme } from '../../app/contexts/ThemeContext';

interface FormTagInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    placeholder?: string;
    helperText?: string;
    disabled?: boolean;
}

const FormTagInput = <T extends FieldValues>({
    name,
    control,
    label,
    rules,
    placeholder = 'Add tags',
    helperText,
    disabled = false,
}: FormTagInputProps<T>) => {
    const { theme } = useTheme();
    const [tagText, setTagText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

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
            flexWrap: 'wrap',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.xl,
            padding: theme.spacing.s,
            minHeight: 48,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
        },
        inputContainerFocused: {
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 2,
        },
        inputContainerError: {
            backgroundColor: `${theme.colors.error}10`,
        },
        input: {
            flex: 1,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            padding: theme.spacing.xs,
            minWidth: 120,
        },
        tagContainer: {
            flexDirection: 'row',
            backgroundColor: theme.colors.primary + '20',
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.xs,
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            alignItems: 'center',
        },
        tagText: {
            color: theme.colors.primary,
            marginRight: theme.spacing.xs,
        },
        removeTagButton: {
            padding: 2,
        },
        tagsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: theme.spacing.xs,
        },
        helperText: {
            marginTop: theme.spacing.xs,
        },
        disabled: {
            opacity: 0.5,
        },
    }));

    const handleAddTag = (value: string[], onChange: (value: string[]) => void) => {
        if (!tagText.trim()) return;

        // Prevent duplicate tags
        if (!value.includes(tagText.trim())) {
            const newTags = [...value, tagText.trim()];
            onChange(newTags);
        }

        setTagText('');
    };

    const handleRemoveTag = (tagToRemove: string, value: string[], onChange: (value: string[]) => void) => {
        const newTags = value.filter(tag => tag !== tagToRemove);
        onChange(newTags);
    };

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field: { onChange, value = [], onBlur }, fieldState: { error } }) => {
                return (
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
                                disabled && styles.disabled,
                            ]}
                        >
                            {Array.isArray(value) && value.length > 0 && (
                                <View style={styles.tagsRow}>
                                    {value.map((tag, index) => (
                                        <View key={index} style={styles.tagContainer}>
                                            <Typography style={styles.tagText}>
                                                {tag}
                                            </Typography>
                                            {!disabled && (
                                                <TouchableOpacity
                                                    style={styles.removeTagButton}
                                                    onPress={() => handleRemoveTag(tag, value, onChange)}
                                                >
                                                    <Icon
                                                        name="x"
                                                        width={14}
                                                        height={14}
                                                        color={theme.colors.primary}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}

                            {!disabled && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={placeholder}
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={tagText}
                                        onChangeText={setTagText}
                                        onSubmitEditing={() => handleAddTag(value || [], onChange)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => {
                                            setIsFocused(false);
                                            onBlur();
                                        }}
                                        blurOnSubmit={false}
                                    />
                                    <TouchableOpacity
                                        onPress={() => handleAddTag(value || [], onChange)}
                                        disabled={!tagText.trim()}
                                    >
                                        <Icon
                                            name="plus"
                                            width={20}
                                            height={20}
                                            color={tagText.trim() ? theme.colors.primary : theme.colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

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
};

export default FormTagInput; 