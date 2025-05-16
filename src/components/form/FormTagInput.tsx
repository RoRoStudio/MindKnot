// src/components/form/FormTagInput.tsx
import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import FormErrorMessage from './FormErrorMessage';
import { generateSimpleId } from '../../utils/uuidUtil';

interface FormTagInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    helperText?: string;
    placeholder?: string;
}

export default function FormTagInput<T extends FieldValues>({
    name,
    control,
    label,
    helperText,
    placeholder = 'Add a tag...',
}: FormTagInputProps<T>) {
    const [tagInput, setTagInput] = useState('');

    const styles = useStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.components.inputs.background,
            borderWidth: 1,
            borderColor: theme.components.inputs.border,
            borderRadius: theme.components.inputs.radius,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
        },
        input: {
            flex: 1,
            padding: theme.spacing.s,
            color: theme.components.inputs.text,
        },
        addButton: {
            padding: theme.spacing.xs,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
        },
        tagItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.primaryLight,
            borderRadius: theme.shape.radius.s,
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.s,
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
        },
        tagText: {
            color: theme.colors.white,
            marginRight: theme.spacing.xs,
        },
        removeTagButton: {
            padding: 2,
        },
        tagsScrollView: {
            maxHeight: 100,
        },
        helperText: {
            marginTop: 4,
        },
    }));

    const handleAddTag = (onChange: (value: string[]) => void, currentTags: string[]) => {
        if (!tagInput.trim()) return;

        // Check if tag already exists
        if (!currentTags.includes(tagInput.trim())) {
            const newTags = [...currentTags, tagInput.trim()];
            onChange(newTags);
        }

        setTagInput('');
    };

    const handleRemoveTag = (tag: string, onChange: (value: string[]) => void, currentTags: string[]) => {
        const newTags = currentTags.filter(t => t !== tag);
        onChange(newTags);
    };

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value = [] }, fieldState: { error } }) => (
                <View style={styles.container}>
                    {label && (
                        <Typography variant="body1" style={styles.label}>
                            {label}
                        </Typography>
                    )}

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={tagInput}
                            onChangeText={setTagInput}
                            placeholder={placeholder}
                            onSubmitEditing={() => handleAddTag(onChange, value)}
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleAddTag(onChange, value)}
                        >
                            <Icon name="plus" width={20} height={20} color={styles.input.color} />
                        </TouchableOpacity>
                    </View>

                    {value && value.length > 0 && (
                        <ScrollView
                            horizontal={false}
                            style={styles.tagsScrollView}
                            contentContainerStyle={styles.tagsContainer}
                        >
                            {value.map((tag: string, index: number) => (
                                <View key={index} style={styles.tagItem}>
                                    <Typography style={styles.tagText}>
                                        {tag}
                                    </Typography>
                                    <TouchableOpacity
                                        style={styles.removeTagButton}
                                        onPress={() => handleRemoveTag(tag, onChange, value)}
                                    >
                                        <Icon name="x" width={14} height={14} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
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