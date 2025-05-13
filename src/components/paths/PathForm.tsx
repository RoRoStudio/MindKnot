// src/components/paths/PathForm.tsx
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
    FormDatePicker,
    FormSelect,
    FormArrayField,
} from '../form';
import { v4 as uuidv4 } from 'uuid';

interface PathFormProps {
    onSubmit: (data: any) => void;
    initialData?: any;
    sagas?: Array<{ id: string; name: string }>;
}

export default function PathForm({ onSubmit, initialData, sagas = [] }: PathFormProps) {
    const sagaOptions = sagas.map(saga => ({
        label: saga.name,
        value: saga.id
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
        milestone: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        milestoneHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        deleteButton: {
            padding: theme.spacing.xs,
        },
        action: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginTop: theme.spacing.s,
        },
        actionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
    }));

    const defaultValues = {
        title: initialData?.title || '',
        description: initialData?.description || '',
        startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
        targetDate: initialData?.targetDate ? new Date(initialData.targetDate) : undefined,
        sagaId: initialData?.sagaId || '',
        milestones: initialData?.milestones || [],
    };

    const { control, handleSubmit } = useForm({
        defaultValues,
    });

    const handleFormSubmit = (data: any) => {
        onSubmit({
            ...data,
            milestones: data.milestones?.map((milestone: any) => ({
                ...milestone,
                id: milestone.id || uuidv4(),
                actions: milestone.actions?.map((action: any) => ({
                    ...action,
                    id: action.id || uuidv4(),
                })) || [],
            })),
        });
    };

    const renderAction = (
        action: any,
        milestoneIndex: number,
        actionIndex: number,
        removeAction: (index: number) => void
    ) => {
        return (
            <View style={styles.action}>
                <View style={styles.actionHeader}>
                    <Typography variant="h4">Action {actionIndex + 1}</Typography>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => removeAction(actionIndex)}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Icon name="minus" width={16} height={16} color="red" />
                    </TouchableOpacity>
                </View>

                <FormInput
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.name`}
                    control={control}
                    label="Name"
                    placeholder="Action name"
                    rules={{ required: 'Name is required' }}
                />

                <FormTextarea
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.description`}
                    control={control}
                    label="Description (optional)"
                    placeholder="Describe this action..."
                    numberOfLines={3}
                />

                <FormDatePicker
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.dueDate`}
                    control={control}
                    label="Due Date (optional)"
                    placeholder="Select a due date"
                />

                <FormSelect
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.sagaId`}
                    control={control}
                    label="Link to Saga (optional)"
                    options={sagaOptions}
                    placeholder="Select a saga"
                />
            </View>
        );
    };

    const renderMilestone = (milestone: any, index: number, remove: (index: number) => void) => {
        const renderActionsArray = (item: any, actionIndex: number, removeAction: (index: number) => void) => {
            return renderAction(item, index, actionIndex, removeAction);
        };

        return (
            <View style={styles.milestone}>
                <View style={styles.milestoneHeader}>
                    <Typography variant="h3">Milestone {index + 1}</Typography>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => remove(index)}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Icon name="minus" width={16} height={16} color="red" />
                    </TouchableOpacity>
                </View>

                <FormInput
                    name={`milestones.${index}.title`}
                    control={control}
                    label="Title"
                    placeholder="Milestone title"
                    rules={{ required: 'Title is required' }}
                />

                <FormTextarea
                    name={`milestones.${index}.description`}
                    control={control}
                    label="Description (optional)"
                    placeholder="Describe this milestone..."
                    numberOfLines={3}
                />

                <FormArrayField
                    name={`milestones.${index}.actions`}
                    control={control}
                    label="Actions"
                    renderItem={renderActionsArray}
                    addButtonLabel="Add Action"
                    defaultValue={{ id: uuidv4(), name: '', description: '', done: false }}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Form onSubmit={handleSubmit(handleFormSubmit)}>
                    <FormInput
                        name="title"
                        control={control}
                        label="Path Title"
                        placeholder="E.g. Learn React Native"
                        rules={{ required: 'Title is required' }}
                    />

                    <FormTextarea
                        name="description"
                        control={control}
                        label="Description (optional)"
                        placeholder="Describe this path..."
                        numberOfLines={3}
                    />

                    <FormDatePicker
                        name="startDate"
                        control={control}
                        label="Start Date (optional)"
                        placeholder="Select a start date"
                    />

                    <FormDatePicker
                        name="targetDate"
                        control={control}
                        label="Target Date (optional)"
                        placeholder="Select a target date"
                    />

                    <FormSelect
                        name="sagaId"
                        control={control}
                        label="Link to Saga (optional)"
                        options={sagaOptions}
                        placeholder="Select a saga"
                    />

                    <FormArrayField
                        name="milestones"
                        control={control}
                        label="Milestones"
                        renderItem={renderMilestone}
                        addButtonLabel="Add Milestone"
                        defaultValue={{ id: uuidv4(), title: '', description: '', actions: [] }}
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            label="Save Path"
                            variant="primary"
                            onPress={handleSubmit(handleFormSubmit)}
                        />
                    </View>
                </Form>
            </ScrollView>
        </View>
    );
}