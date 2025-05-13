// src/components/captures/CaptureForm.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import {
    Form,
    FormSelect,
    FormInput,
    FormTextarea,
    FormDatePicker,
    FormCheckbox,
    FormMoodSelector,
    FormArrayField
} from '../form';
import { CaptureSubType } from '../../types/capture';
import { v4 as uuidv4 } from 'uuid';

// Options for capture type dropdown
const CAPTURE_TYPE_OPTIONS = [
    { label: 'Note', value: CaptureSubType.NOTE },
    { label: 'Spark', value: CaptureSubType.SPARK },
    { label: 'Action', value: CaptureSubType.ACTION },
    { label: 'Reflection', value: CaptureSubType.REFLECTION },
];

interface CaptureFormProps {
    onSubmit: (data: any) => void;
    initialData?: any;
    sagas?: Array<{ id: string; name: string }>;
}

export default function CaptureForm({ onSubmit, initialData, sagas = [] }: CaptureFormProps) {
    const [captureType, setCaptureType] = useState<CaptureSubType>(
        initialData?.subType || CaptureSubType.NOTE
    );

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
        subAction: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.s,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
        },
        subActionContent: {
            flex: 1,
        },
        deleteButton: {
            padding: theme.spacing.xs,
        },
    }));

    const defaultValues = {
        subType: initialData?.subType || CaptureSubType.NOTE,
        title: initialData?.title || '',
        body: initialData?.body || '',
        sagaId: initialData?.sagaId || '',
        tags: initialData?.tags || [],
        mood: initialData?.mood || 3, // Default to neutral mood
        prompt: initialData?.prompt || '',
        done: initialData?.done || false,
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
        subActions: initialData?.subActions || [],
    };

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues,
    });

    const handleFormSubmit = (data: any) => {
        onSubmit({
            ...data,
            subActions: data.subActions?.map((action: any) => ({
                ...action,
                id: action.id || uuidv4(),
            })),
        });
    };

    const renderSubAction = (item: any, index: number, remove: (index: number) => void) => {
        return (
            <View style={styles.subAction}>
                <View style={styles.subActionContent}>
                    <FormInput
                        name={`subActions.${index}.text`}
                        control={control}
                        placeholder="Sub-action"
                        rules={{ required: 'Sub-action text is required' }}
                    />
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => remove(index)}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                    <Icon name="minus" width={16} height={16} color="red" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.formContainer}>
                <Form onSubmit={handleSubmit(handleFormSubmit)}>
                    <FormSelect
                        name="subType"
                        control={control}
                        label="Capture Type"
                        options={CAPTURE_TYPE_OPTIONS}
                        rules={{ required: 'Capture type is required' }}
                        onChange={(value) => setCaptureType(value as CaptureSubType)}
                    />

                    <FormInput
                        name="title"
                        control={control}
                        label="Title"
                        placeholder="Enter a title..."
                        rules={{ required: 'Title is required' }}
                    />

                    <FormSelect
                        name="sagaId"
                        control={control}
                        label="Saga"
                        options={sagaOptions}
                        placeholder="Select a saga (optional)"
                    />

                    {captureType === CaptureSubType.NOTE && (
                        <FormTextarea
                            name="body"
                            control={control}
                            label="Note"
                            placeholder="Write your note..."
                            rules={{ required: 'Note content is required' }}
                            numberOfLines={6}
                        />
                    )}

                    {captureType === CaptureSubType.SPARK && (
                        <FormTextarea
                            name="body"
                            control={control}
                            label="Spark"
                            placeholder="Capture your insight..."
                            rules={{ required: 'Spark content is required' }}
                            numberOfLines={3}
                        />
                    )}

                    {captureType === CaptureSubType.REFLECTION && (
                        <>
                            <FormInput
                                name="prompt"
                                control={control}
                                label="Reflection Prompt (optional)"
                                placeholder="What prompted this reflection?"
                            />

                            <FormMoodSelector
                                name="mood"
                                control={control}
                                label="How are you feeling?"
                                rules={{ required: 'Please select a mood' }}
                            />

                            <FormTextarea
                                name="body"
                                control={control}
                                label="Reflection"
                                placeholder="Write your reflection..."
                                rules={{ required: 'Reflection content is required' }}
                                numberOfLines={6}
                            />
                        </>
                    )}

                    {captureType === CaptureSubType.ACTION && (
                        <>
                            <FormTextarea
                                name="body"
                                control={control}
                                label="Action Details"
                                placeholder="Describe the action..."
                                rules={{ required: 'Action description is required' }}
                                numberOfLines={3}
                            />

                            <FormDatePicker
                                name="dueDate"
                                control={control}
                                label="Due Date (optional)"
                                placeholder="Select a due date"
                            />

                            <FormCheckbox
                                name="done"
                                control={control}
                                label="Complete"
                            />

                            <FormArrayField
                                name="subActions"
                                control={control}
                                label="Sub-Actions"
                                renderItem={renderSubAction}
                                addButtonLabel="Add Sub-Action"
                                defaultValue={{ id: uuidv4(), text: '', done: false }}
                            />
                        </>
                    )}

                    <View style={styles.buttonContainer}>
                        <Button
                            label="Save Capture"
                            variant="primary"
                            onPress={handleSubmit(handleFormSubmit)}
                        />
                    </View>
                </Form>
            </ScrollView>
        </View>
    );
}