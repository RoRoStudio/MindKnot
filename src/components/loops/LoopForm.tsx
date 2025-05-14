// src/components/loops/LoopForm.tsx
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import {
    Form,
    FormInput,
    FormTextarea,
    FormSelect,
    FormArrayField,
} from '../form';
import { generateSimpleId } from '../../utils/uuidUtil';

// Frequency options
const FREQUENCY_OPTIONS = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekdays', value: 'weekdays' },
    { label: 'Weekends', value: 'weekends' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Custom', value: 'custom' },
];

interface LoopFormProps {
    onSubmit: (data: any) => void;
    initialData?: any;
    sagas?: Array<{ id: string; name: string; icon?: string }>;
}

export default function LoopForm({ onSubmit, initialData, sagas = [] }: LoopFormProps) {
    const sagaOptions = sagas.map(saga => ({
        label: saga.name,
        value: saga.id,
        icon: saga.icon
    }));

    // Add an empty option
    sagaOptions.unshift({ label: 'None', value: '' });

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
        },
        formContainer: {
            padding: theme.spacing.m,
        },
        buttonContainer: {
            marginTop: theme.spacing.l,
        },
        loopItem: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.s,
        },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        deleteButton: {
            padding: theme.spacing.xs,
        },
    }));

    const defaultValues = {
        title: initialData?.title || '',
        description: initialData?.description || '',
        frequency: initialData?.frequency || 'daily',
        sagaId: initialData?.sagaId || '',
        items: initialData?.items || [],
    };

    const { control, handleSubmit } = useForm({
        defaultValues,
    });

    const handleFormSubmit = (data: any) => {
        onSubmit({
            ...data,
            items: data.items?.map((item: any) => ({
                ...item,
                id: item.id || generateSimpleId(),
            })),
        });
    };

    const renderLoopItem = (item: any, index: number, remove: (index: number) => void) => {
        return (
            <View style={styles.loopItem}>
                <View style={styles.itemHeader}>
                    <Typography variant="h4">Item {index + 1}</Typography>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => remove(index)}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Icon name="minus" width={16} height={16} color="red" />
                    </TouchableOpacity>
                </View>

                <FormInput
                    name={`items.${index}.name`}
                    control={control}
                    label="Name"
                    placeholder="Item name"
                    rules={{ required: 'Name is required' }}
                />

                <FormTextarea
                    name={`items.${index}.description`}
                    control={control}
                    label="Description (optional)"
                    placeholder="Describe this item..."
                    numberOfLines={3}
                />

                <FormInput
                    name={`items.${index}.durationMinutes`}
                    control={control}
                    label="Duration (minutes, optional)"
                    placeholder="e.g. 30"
                    keyboardType="numeric"
                />

                <FormInput
                    name={`items.${index}.quantity`}
                    control={control}
                    label="Quantity (optional)"
                    placeholder="e.g. 3 sets"
                />

                <FormSelect
                    name={`items.${index}.sagaId`}
                    control={control}
                    label="Link to Saga (optional)"
                    options={sagaOptions}
                    placeholder="Select a saga"
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Form onSubmit={handleSubmit(handleFormSubmit)}>
                    <FormSelect
                        name="sagaId"
                        control={control}
                        label="Link to Saga (optional)"
                        options={sagaOptions}
                        placeholder="Select a saga"
                    />

                    <FormInput
                        name="title"
                        control={control}
                        label="Loop Title"
                        placeholder="E.g. Morning Routine"
                        rules={{ required: 'Title is required' }}
                    />

                    <FormTextarea
                        name="description"
                        control={control}
                        label="Description (optional)"
                        placeholder="Describe this loop..."
                        numberOfLines={3}
                    />

                    <FormSelect
                        name="frequency"
                        control={control}
                        label="Frequency"
                        options={FREQUENCY_OPTIONS}
                        rules={{ required: 'Frequency is required' }}
                    />

                    <FormArrayField
                        name="items"
                        control={control}
                        label="Loop Items"
                        renderItem={renderLoopItem}
                        addButtonLabel="Add Loop Item"
                        defaultValue={{ name: '', description: '' }}
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            label="Save Loop"
                            variant="primary"
                            onPress={handleSubmit(handleFormSubmit)}
                        />
                    </View>
                </Form>
            </ScrollView>
        </View>
    );
}