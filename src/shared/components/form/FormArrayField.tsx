// src/components/form/FormArrayField.tsx
import React from 'react';
import {
    View,
    TouchableOpacity,
} from 'react-native';
import { Control, FieldValues, useFieldArray, FieldArrayPath, DeepPartial } from 'react-hook-form';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Typography, Icon, Button } from '..';
import { FormErrorMessage } from './FormErrorMessage';
import { generateSimpleId } from '../../utils/uuidUtil';

interface FormArrayFieldProps<TFieldValues extends FieldValues = FieldValues> {
    name: string;
    control: Control<TFieldValues>;
    label?: string;
    helperText?: string;
    keyName?: string;
    defaultValue?: any;
    renderItem: (item: any, index: number, remove: (index: number) => void) => React.ReactNode;
    addButtonLabel: string;
    maxItems?: number;
    showError?: boolean;
    error?: string;
    defaultItem?: any;
}

export default function FormArrayField<TFieldValues extends FieldValues = FieldValues>({
    name,
    control,
    label,
    helperText,
    keyName = 'id',
    defaultValue,
    renderItem,
    addButtonLabel = 'Add Item',
    maxItems,
    showError = true,
    error,
    defaultItem,
}: FormArrayFieldProps<TFieldValues>) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: name as any, // Use type assertion to work around the type issue
        keyName,
    });

    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.s,
        },
        itemsContainer: {
            marginBottom: theme.spacing.s,
        },
        item: {
            marginBottom: theme.spacing.s,
        },
        addButton: {
            alignSelf: 'flex-start',
        },
        emptyContainer: {
            padding: theme.spacing.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.shape.radius.m,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.s,
        },
        emptyText: {
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.s,
        },
        helperText: {
            marginTop: 4,
        },
    }));

    const handleAdd = () => {
        if (maxItems && fields.length >= maxItems) {
            return;
        }
        // Ensure we always have an ID in the defaultValue using our synchronous ID generator
        const itemToAdd = defaultItem
            ? { ...defaultItem, id: defaultItem.id || generateSimpleId() }
            : defaultValue
                ? { ...defaultValue, id: defaultValue.id || generateSimpleId() }
                : { id: generateSimpleId() };

        // Add the item to the array
        append(itemToAdd);

        // Add a small delay to let the DOM update before trying to focus
        setTimeout(() => {
            // The focus error happens in React Native - we can't really focus
            // on a newly created field element automatically. This is a browser
            // functionality that doesn't translate well to React Native.
            // We'll just let the item be added without focusing
        }, 50);
    };

    const isMaxItems = maxItems ? fields.length >= maxItems : false;

    return (
        <View style={styles.container}>
            {label && (
                <Typography variant="body1" style={styles.label}>
                    {label}
                </Typography>
            )}

            {fields.length > 0 ? (
                <View style={styles.itemsContainer}>
                    {fields.map((field, index) => (
                        <View key={field.id} style={styles.item}>
                            {renderItem(field, index, remove)}
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Icon name="list" width={32} height={32} color={styles.emptyText.color} />
                    <Typography style={styles.emptyText}>No items yet</Typography>
                </View>
            )}

            <Button
                variant="secondary"
                label={addButtonLabel}
                leftIcon="plus"
                onPress={handleAdd}
                style={styles.addButton}
                disabled={isMaxItems}
                size="small"
            />

            {showError && error && <FormErrorMessage message={error} />}

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
}