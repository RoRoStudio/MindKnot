// src/components/form/FormTagInput.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Keyboard,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Tag } from '../atoms/Tag';
import FormErrorMessage from './FormErrorMessage';

// Maximum tag length for mobile UI
const MAX_TAG_LENGTH = 20;

// Maximum number of suggestions to show
const MAX_SUGGESTIONS = 5;

interface FormTagInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    helperText?: string;
    placeholder?: string;
}

// Local storage key for saving used tags
const USED_TAGS_STORAGE_KEY = 'mindknot_used_tags';

// Keep a local copy of used tags for the current session
let cachedUsedTags: string[] = [];

export default function FormTagInput<T extends FieldValues>({
    name,
    control,
    label,
    helperText,
    placeholder = 'Add a tag...',
}: FormTagInputProps<T>) {
    const { theme } = useTheme();
    const [tagInput, setTagInput] = useState('');
    const [usedTags, setUsedTags] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const windowWidth = Dimensions.get('window').width;

    // Load previously used tags from storage
    useEffect(() => {
        const loadUsedTags = async () => {
            try {
                // In a real implementation, this would use AsyncStorage
                // Since we don't have it imported, we'll use the cached tags
                if (cachedUsedTags.length > 0) {
                    setUsedTags(cachedUsedTags);
                }
            } catch (error) {
                console.error('Error loading used tags:', error);
            }
        };

        loadUsedTags();
    }, []);

    // Update suggestions when tagInput changes
    useEffect(() => {
        if (!tagInput) {
            // If no input, show recent tags
            setSuggestions(usedTags.slice(0, MAX_SUGGESTIONS));
            return;
        }

        // Filter tags that match the input
        const filtered = usedTags.filter(tag =>
            tag.toLowerCase().includes(tagInput.toLowerCase())
        );

        setSuggestions(filtered.slice(0, MAX_SUGGESTIONS));
    }, [tagInput, usedTags]);

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
            backgroundColor: theme.components.inputs.background,
            borderWidth: 1,
            borderColor: isFocused
                ? theme.components.inputs.focusBorder
                : theme.components.inputs.border,
            borderRadius: theme.components.inputs.radius,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            width: '100%',
        },
        input: {
            flex: 1,
            padding: theme.spacing.s,
            color: theme.components.inputs.text,
            minWidth: 150, // Ensure minimum width
        },
        addButton: {
            padding: theme.spacing.xs,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
            width: '100%',
        },
        tagItem: {
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
        },
        helperText: {
            marginTop: 4,
        },
        suggestionsContainer: {
            marginTop: 4,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.shape.radius.s,
            maxHeight: 150,
            backgroundColor: theme.colors.surface,
            width: '100%',
        },
        suggestionItem: {
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        suggestionText: {
            color: theme.colors.textPrimary,
        },
        noSuggestions: {
            padding: theme.spacing.m,
            alignItems: 'center',
        },
        characterCount: {
            position: 'absolute',
            right: theme.spacing.m * 2 + 24, // Account for addButton width
            color: theme.colors.textSecondary,
            fontSize: 10,
        },
    }));

    // Save tag to used tags list
    const saveTagToUsed = (tag: string) => {
        // Only save if it's not already in the list
        if (!usedTags.includes(tag)) {
            const newUsedTags = [tag, ...usedTags.slice(0, 49)]; // Keep max 50 tags
            setUsedTags(newUsedTags);
            cachedUsedTags = newUsedTags;

            // In a real implementation, this would save to AsyncStorage
            // AsyncStorage.setItem(USED_TAGS_STORAGE_KEY, JSON.stringify(newUsedTags));
        }
    };

    const handleAddTag = (onChange: (value: string[]) => void, currentTags: string[]) => {
        if (!tagInput.trim()) return;

        const tag = tagInput.trim().slice(0, MAX_TAG_LENGTH);

        // Check if tag already exists
        if (!currentTags.includes(tag)) {
            const newTags = [...currentTags, tag];
            onChange(newTags);

            // Save to used tags
            saveTagToUsed(tag);
        }

        setTagInput('');
        setSuggestions([]);
    };

    const handleRemoveTag = (tag: string, onChange: (value: string[]) => void, currentTags: string[]) => {
        const newTags = currentTags.filter(t => t !== tag);
        onChange(newTags);
    };

    const handleSelectSuggestion = (tag: string, onChange: (value: string[]) => void, currentTags: string[]) => {
        if (!currentTags.includes(tag)) {
            const newTags = [...currentTags, tag];
            onChange(newTags);
        }
        setTagInput('');
        setSuggestions([]);
        Keyboard.dismiss();
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
                            ref={inputRef}
                            style={styles.input}
                            value={tagInput}
                            onChangeText={(text) => {
                                // Limit input to max characters
                                if (text.length <= MAX_TAG_LENGTH) {
                                    setTagInput(text);
                                }
                            }}
                            placeholder={placeholder}
                            onSubmitEditing={() => handleAddTag(onChange, value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />

                        {tagInput.length > 0 && (
                            <Typography style={styles.characterCount}>
                                {tagInput.length}/{MAX_TAG_LENGTH}
                            </Typography>
                        )}

                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleAddTag(onChange, value)}
                            disabled={!tagInput.trim()}
                        >
                            <Icon
                                name="plus"
                                width={20}
                                height={20}
                                color={tagInput.trim() ? theme.colors.primary : theme.colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Suggestions */}
                    {isFocused && suggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            <FlatList
                                data={suggestions}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.suggestionItem}
                                        onPress={() => handleSelectSuggestion(item, onChange, value)}
                                    >
                                        <Typography style={styles.suggestionText}>{item}</Typography>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}

                    {/* Display added tags */}
                    {value && value.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {value.map((tag: string, index: number) => (
                                <Tag
                                    key={index}
                                    label={tag}
                                    size="medium"
                                    removable
                                    onRemove={() => handleRemoveTag(tag, onChange, value)}
                                    style={styles.tagItem}
                                />
                            ))}
                        </View>
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