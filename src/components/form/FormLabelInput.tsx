import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    Keyboard,
    ScrollView,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { Label } from '../atoms/Label';
import Button from '../atoms/Button';
import FormErrorMessage from './FormErrorMessage';

// Maximum label length for mobile UI
const MAX_LABEL_LENGTH = 20;

// Maximum number of suggestions to show
const MAX_SUGGESTIONS = 5;

interface FormLabelInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    helperText?: string;
    placeholder?: string;
    // Direct update handler for EntryMetadataBar usage
    onLabelsChange?: (labels: string[]) => void;
    // Current labels (for direct usage without react-hook-form)
    currentLabels?: string[];
    // Callback when done adding
    onDone?: () => void;
}

// Local storage key for saving used labels
const USED_LABELS_STORAGE_KEY = 'mindknot_used_labels';

// Keep a local copy of used labels for the current session
let cachedUsedLabels: string[] = [];

export default function FormLabelInput<T extends FieldValues>({
    name,
    control,
    label,
    helperText,
    placeholder = 'Add a label...',
    onLabelsChange,
    currentLabels,
    onDone
}: FormLabelInputProps<T>) {
    const { theme } = useTheme();
    const [labelInput, setLabelInput] = useState('');
    const [usedLabels, setUsedLabels] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Load previously used labels from storage
    useEffect(() => {
        const loadUsedLabels = async () => {
            try {
                // In a real implementation, this would use AsyncStorage
                // Since we don't have it imported, we'll use the cached labels
                if (cachedUsedLabels.length > 0) {
                    setUsedLabels(cachedUsedLabels);
                }
            } catch (error) {
                console.error('Error loading used labels:', error);
            }
        };

        loadUsedLabels();
    }, []);

    // Update suggestions when labelInput changes
    useEffect(() => {
        if (!labelInput) {
            // If no input, show recent labels
            setSuggestions(usedLabels.slice(0, MAX_SUGGESTIONS));
            return;
        }

        // Filter labels that match the input
        const filtered = usedLabels.filter(label =>
            label.toLowerCase().includes(labelInput.toLowerCase())
        );

        setSuggestions(filtered.slice(0, MAX_SUGGESTIONS));
    }, [labelInput, usedLabels]);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
        label: {
            marginBottom: theme.spacing.s,
            fontSize: theme.typography.fontSize.m,
            fontWeight: '500',
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            marginBottom: theme.spacing.m,
        },
        inputWrapper: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            marginRight: theme.spacing.s,
            minHeight: 48,
        },
        input: {
            flex: 1,
            color: theme.colors.textPrimary,
            backgroundColor: 'transparent',
            fontSize: theme.typography.fontSize.m,
            padding: theme.spacing.s,
        },
        labelsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: '100%',
            marginBottom: theme.spacing.l,
        },
        actionButton: {
            justifyContent: 'center',
            alignItems: 'center',
            width: 48,
            height: 48,
            borderRadius: theme.shape.radius.m,
            backgroundColor: theme.colors.surfaceVariant,
        },
        helperText: {
            marginTop: theme.spacing.s,
            marginBottom: theme.spacing.m,
        },
        suggestionsContainer: {
            marginVertical: theme.spacing.s,
            borderRadius: theme.shape.radius.m,
            maxHeight: 200,
            backgroundColor: theme.colors.surfaceVariant,
            width: '100%',
            marginBottom: theme.spacing.m,
        },
        suggestionItem: {
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        suggestionText: {
            color: theme.colors.textPrimary,
            fontSize: theme.typography.fontSize.m,
        },
        characterCount: {
            color: theme.colors.textSecondary,
            fontSize: 12,
            marginLeft: theme.spacing.xs,
        },
        sectionTitle: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.m,
            marginBottom: theme.spacing.s,
        },
        existingLabelsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: theme.spacing.l,
            width: '100%',
        },
        existingLabelChip: {
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
        },
        footer: {
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 'auto',
            paddingVertical: theme.spacing.m,
        },
        contentContainer: {
            flex: 1,
            width: '100%',
        }
    }));

    // Save label to used labels list
    const saveLabelToUsed = (label: string) => {
        // Only save if it's not already in the list
        if (!usedLabels.includes(label)) {
            const newUsedLabels = [label, ...usedLabels.slice(0, 49)]; // Keep max 50 labels
            setUsedLabels(newUsedLabels);
            cachedUsedLabels = newUsedLabels;

            // In a real implementation, this would save to AsyncStorage
            // AsyncStorage.setItem(USED_LABELS_STORAGE_KEY, JSON.stringify(newUsedLabels));
        }
    };

    const handleAddLabel = (onChange: (value: string[]) => void, currentLabels: string[]) => {
        if (!labelInput.trim()) return;

        const label = labelInput.trim().slice(0, MAX_LABEL_LENGTH);

        // Check if label already exists
        if (!currentLabels.includes(label)) {
            const newLabels = [...currentLabels, label];
            onChange(newLabels);

            // If direct handler is provided, use it
            if (onLabelsChange) {
                onLabelsChange(newLabels);
            }

            // Save to used labels
            saveLabelToUsed(label);
        }

        setLabelInput('');
        setSuggestions([]);
    };

    const handleRemoveLabel = (label: string, onChange: (value: string[]) => void, currentLabels: string[]) => {
        const newLabels = currentLabels.filter(t => t !== label);
        onChange(newLabels);

        // If direct handler is provided, use it
        if (onLabelsChange) {
            onLabelsChange(newLabels);
        }
    };

    const handleSelectSuggestion = (label: string, onChange: (value: string[]) => void, currentLabels: string[]) => {
        if (!currentLabels.includes(label)) {
            const newLabels = [...currentLabels, label];
            onChange(newLabels);

            // If direct handler is provided, use it
            if (onLabelsChange) {
                onLabelsChange(newLabels);
            }
        }
        setLabelInput('');
        setSuggestions([]);
    };

    const handleDone = () => {
        if (onDone) {
            onDone();
        }
    };

    // Filter out labels that are already selected
    const getAvailableLabels = (currentLabels: string[]) => {
        return usedLabels.filter(label => !currentLabels.includes(label));
    };

    const handleSelectExistingLabel = (label: string, onChange: (value: string[]) => void, currentLabels: string[]) => {
        if (!currentLabels.includes(label)) {
            const newLabels = [...currentLabels, label];
            onChange(newLabels);

            // If direct handler is provided, use it
            if (onLabelsChange) {
                onLabelsChange(newLabels);
            }
        }
    };

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value = [] }, fieldState: { error } }) => {
                // Use provided currentLabels if available (for direct usage)
                const labels = currentLabels !== undefined ? currentLabels : value;
                const availableLabels = getAvailableLabels(labels);

                return (
                    <View style={styles.container}>
                        <View style={styles.contentContainer}>
                            {label && (
                                <Typography variant="body1" style={styles.label}>
                                    {label}
                                </Typography>
                            )}

                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        ref={inputRef}
                                        style={styles.input}
                                        value={labelInput}
                                        onChangeText={(text) => {
                                            // Limit input to max characters
                                            if (text.length <= MAX_LABEL_LENGTH) {
                                                setLabelInput(text);
                                            }
                                        }}
                                        placeholder={placeholder}
                                        onSubmitEditing={() => handleAddLabel(onChange, labels)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                    />

                                    {labelInput.length > 0 && (
                                        <Typography style={styles.characterCount}>
                                            {labelInput.length}/{MAX_LABEL_LENGTH}
                                        </Typography>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleAddLabel(onChange, labels)}
                                    disabled={!labelInput.trim()}
                                >
                                    <Icon
                                        name="plus"
                                        size={24}
                                        color={labelInput.trim() ? theme.colors.primary : theme.colors.textSecondary}
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
                                                onPress={() => handleSelectSuggestion(item, onChange, labels)}
                                            >
                                                <Typography style={styles.suggestionText}>{item}</Typography>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            )}

                            {/* Display added labels */}
                            {labels && labels.length > 0 && (
                                <View style={styles.labelsContainer}>
                                    {labels.map((label: string, index: number) => (
                                        <Label
                                            key={index}
                                            label={label}
                                            size="medium"
                                            removable
                                            onRemove={() => handleRemoveLabel(label, onChange, labels)}
                                        />
                                    ))}
                                </View>
                            )}

                            {/* Display existing labels for selection */}
                            {availableLabels.length > 0 && (
                                <>
                                    <Typography style={styles.sectionTitle}>
                                        Recently Used Labels
                                    </Typography>
                                    <View style={styles.existingLabelsContainer}>
                                        {availableLabels.map((label, index) => (
                                            <Label
                                                key={index}
                                                label={label}
                                                size="medium"
                                                selectable
                                                onPress={() => handleSelectExistingLabel(label, onChange, labels)}
                                                style={styles.existingLabelChip}
                                            />
                                        ))}
                                    </View>
                                </>
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

                        {onDone && (
                            <View style={styles.footer}>
                                <Button
                                    label="Done"
                                    variant="primary"
                                    onPress={handleDone}
                                    size="medium"
                                    fullWidth={false}
                                />
                            </View>
                        )}
                    </View>
                );
            }}
        />
    );
} 