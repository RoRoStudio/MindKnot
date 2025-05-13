// src/components/form/FormArrayField.tsx
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Control, FieldValues, useFieldArray, FieldArrayPath, DeepPartial, FieldArray } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import FormErrorMessage from './FormErrorMessage';

interface FormArrayFieldProps
    TFieldValues extends FieldValues = FieldValues,
    TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
        TKeyName extends string = 'id'
            > {
            name: TFieldArrayName;
            control: Control<TFieldValues>;
            label?: string;
            helperText?: string;
            keyName?: TKeyName;
            defaultValue?: DeepPartial<FieldArray<TFieldValues, TFieldArrayName>>;
            renderItem: (
                item: Record<TKeyName, string> & DeepPartial<FieldArray<TFieldValues, TFieldArrayName>>,
                index: number,
                remove: (index: number) => void
            ) => React.ReactNode;
            addButtonLabel: string;
            maxItems?: number;
            showError?: boolean;
            error?: string;
        }

export default function FormArrayField
    TFieldValues extends FieldValues = FieldValues,
    TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
        TKeyName extends string = 'id'
            > ({
                name,
                control,
                label,
                helperText,
                keyName = 'id' as TKeyName,
                defaultValue,
                renderItem,
                addButtonLabel = 'Add Item',
                maxItems,
                showError = true,
                error,
            }: FormArrayFieldProps<TFieldValues, TFieldArrayName, TKeyName>) {
    const { fields, append, remove } = useFieldArray({
        control,
        name,
        keyName,
    });

    const styles = useStyles((theme) => ({
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
        append(defaultValue || {} as any);
    };

    const isMaxItems = maxItems && fields.length >= maxItems;

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
                        <View key={field[keyName]} style={styles.item}>
                            {renderItem(field as any, index, remove)}
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
                small
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