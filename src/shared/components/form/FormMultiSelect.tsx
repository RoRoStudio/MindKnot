/**
 * FormMultiSelect Component
 * Multi-selection form component with React Hook Form integration
 * 
 * Features:
 * - Multiple item selection with checkboxes
 * - Search functionality
 * - Custom item rendering
 * - Form validation support
 * - Theme integration
 * - Safe null control handling
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { logForm } from '../../utils/debugLogger';
import {
    Typography,
    Card,
    Icon,
} from '../index';

export interface MultiSelectOption {
    /** Unique identifier for the option */
    value: string;
    /** Display label for the option */
    label: string;
    /** Optional description */
    description?: string;
    /** Optional icon name */
    icon?: string;
    /** Whether this option is disabled */
    disabled?: boolean;
}

export interface FormMultiSelectProps<T extends FieldValues> {
    /** Field name for React Hook Form */
    name: Path<T>;
    /** React Hook Form control object */
    control: Control<T>;
    /** Available options to select from */
    options: MultiSelectOption[];
    /** Placeholder text */
    placeholder?: string;
    /** Whether search is enabled */
    searchable?: boolean;
    /** Maximum number of selections allowed */
    maxSelections?: number;
    /** Whether the field is required */
    required?: boolean;
    /** Custom error message */
    errorMessage?: string;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Custom styles */
    style?: any;
}

/**
 * FormMultiSelect component for multiple item selection
 */
export function FormMultiSelect<T extends FieldValues>({
    name,
    control,
    options,
    placeholder = 'Select items...',
    searchable = true,
    maxSelections,
    required = false,
    errorMessage,
    disabled = false,
    style,
}: FormMultiSelectProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    // Safety check for control - return fallback UI if invalid
    if (!control || !control.register) {
        logForm('FormMultiSelect', 'Invalid control provided', { name, hasControl: !!control });
        return (
            <View style={style}>
                <Typography style={{ color: 'red', fontSize: 12 }}>
                    FormMultiSelect Error: Invalid form control
                </Typography>
            </View>
        );
    }

    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        selector: {
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
            minHeight: 48,
        },
        selectorDisabled: {
            backgroundColor: theme.colors.surfaceVariant,
            opacity: 0.6,
        },
        selectorError: {
            borderColor: theme.colors.error,
        },
        selectorHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        selectedCount: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        placeholder: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
        },
        expandIcon: {
            marginLeft: theme.spacing.s,
        },
        selectedItems: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.xs,
            marginTop: theme.spacing.s,
        },
        selectedItem: {
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            backgroundColor: theme.colors.primaryContainer,
            borderRadius: theme.shape.radius.s,
            flexDirection: 'row',
            alignItems: 'center',
        },
        selectedItemText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.onPrimaryContainer,
            marginRight: theme.spacing.xs,
        },
        removeButton: {
            padding: 2,
        },
        dropdown: {
            marginTop: theme.spacing.s,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
            maxHeight: 300,
        },
        optionsList: {
            maxHeight: 200,
        },
        option: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        optionSelected: {
            backgroundColor: theme.colors.primaryContainer,
        },
        optionDisabled: {
            opacity: 0.5,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: theme.colors.border,
            marginRight: theme.spacing.m,
            alignItems: 'center',
            justifyContent: 'center',
        },
        checkboxSelected: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        optionContent: {
            flex: 1,
        },
        optionLabel: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.fontWeight.medium,
        },
        optionDescription: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
        },
        errorText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.error,
            marginTop: theme.spacing.xs,
        },
        emptyState: {
            padding: theme.spacing.l,
            alignItems: 'center',
        },
        emptyText: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
    }));

    // Filter options based on search term
    const filteredOptions = React.useMemo(() => {
        if (!searchTerm.trim()) return options;

        const query = searchTerm.toLowerCase();
        return options.filter(option =>
            option.label.toLowerCase().includes(query) ||
            option.description?.toLowerCase().includes(query)
        );
    }, [options, searchTerm]);

    // Render option item
    const renderOption = React.useCallback(({ item }: { item: MultiSelectOption }) => (
        <Controller
            name={name}
            control={control}
            rules={{ required: required ? 'This field is required' : false }}
            render={({ field: { value, onChange } }) => {
                const selectedValues: string[] = Array.isArray(value) ? value : [];
                const isSelected = selectedValues.includes(item.value);
                const canSelect = !maxSelections || selectedValues.length < maxSelections || isSelected;

                const handleToggle = () => {
                    if (item.disabled || (!canSelect && !isSelected)) return;

                    logForm('FormMultiSelect', `Toggling option: ${item.label}`,
                        { value: item.value, isSelected, selectedCount: selectedValues.length });

                    const newValues = isSelected
                        ? selectedValues.filter((v: string) => v !== item.value)
                        : [...selectedValues, item.value];

                    onChange(newValues);
                };

                return (
                    <TouchableOpacity
                        style={[
                            styles.option,
                            isSelected && styles.optionSelected,
                            item.disabled && styles.optionDisabled,
                        ]}
                        onPress={handleToggle}
                        disabled={item.disabled || (!canSelect && !isSelected)}
                    >
                        <View style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected,
                        ]}>
                            {isSelected && (
                                <Icon
                                    name="check"
                                    size={12}
                                    color="white"
                                />
                            )}
                        </View>

                        <View style={styles.optionContent}>
                            <Typography style={styles.optionLabel}>
                                {item.label}
                            </Typography>
                            {item.description && (
                                <Typography style={styles.optionDescription}>
                                    {item.description}
                                </Typography>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            }}
        />
    ), [name, control, required, maxSelections, styles]);

    try {
        return (
            <Controller
                name={name}
                control={control}
                rules={{ required: required ? 'This field is required' : false }}
                render={({ field: { value }, fieldState: { error } }) => {
                    const selectedValues: string[] = Array.isArray(value) ? value : [];
                    const selectedOptions = options.filter(option =>
                        selectedValues.includes(option.value)
                    );

                    const hasError = !!(error || errorMessage);

                    logForm('FormMultiSelect', `Rendering with ${selectedOptions.length} selected`,
                        { name, disabled, hasError });

                    return (
                        <View style={[styles.container, style]}>
                            {/* Selector */}
                            <TouchableOpacity
                                style={[
                                    styles.selector,
                                    disabled && styles.selectorDisabled,
                                    hasError && styles.selectorError,
                                ]}
                                onPress={() => {
                                    if (!disabled) {
                                        setIsExpanded(!isExpanded);
                                        logForm('FormMultiSelect', `Expanded: ${!isExpanded}`);
                                    }
                                }}
                                disabled={disabled}
                            >
                                <View style={styles.selectorHeader}>
                                    {selectedOptions.length > 0 ? (
                                        <Typography style={styles.selectedCount}>
                                            {selectedOptions.length} selected
                                        </Typography>
                                    ) : (
                                        <Typography style={styles.placeholder}>
                                            {placeholder}
                                        </Typography>
                                    )}

                                    <Icon
                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color={styles.selectedCount.color}
                                        style={styles.expandIcon}
                                    />
                                </View>

                                {/* Selected Items */}
                                {selectedOptions.length > 0 && (
                                    <View style={styles.selectedItems}>
                                        {selectedOptions.map((option) => (
                                            <View key={option.value} style={styles.selectedItem}>
                                                <Typography style={styles.selectedItemText}>
                                                    {option.label}
                                                </Typography>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Dropdown */}
                            {isExpanded && (
                                <Card style={styles.dropdown}>
                                    {/* Options List */}
                                    {filteredOptions.length > 0 ? (
                                        <FlatList
                                            data={filteredOptions}
                                            renderItem={renderOption}
                                            keyExtractor={(item) => item.value}
                                            style={styles.optionsList}
                                            showsVerticalScrollIndicator={false}
                                        />
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Typography style={styles.emptyText}>
                                                {searchTerm.trim()
                                                    ? `No options found for "${searchTerm}"`
                                                    : 'No options available'
                                                }
                                            </Typography>
                                        </View>
                                    )}
                                </Card>
                            )}

                            {/* Error Message */}
                            {hasError && (
                                <Typography style={styles.errorText}>
                                    {error?.message || errorMessage}
                                </Typography>
                            )}
                        </View>
                    );
                }}
            />
        );
    } catch (err) {
        logForm('FormMultiSelect', 'Error rendering FormMultiSelect', err);
        return (
            <View style={style}>
                <Typography style={{ color: 'red', fontSize: 12 }}>
                    FormMultiSelect Error: {err instanceof Error ? err.message : 'Unknown error'}
                </Typography>
            </View>
        );
    }
} 