// src/components/form/FormMoodSelector.tsx
import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../hooks/useStyles';
import { Typography } from './';
import FormErrorMessage from './FormErrorMessage';

// Define mood emoji
const MOOD_OPTIONS = [
    { value: 1, label: '😞', description: 'Very Unhappy' },
    { value: 2, label: '😔', description: 'Unhappy' },
    { value: 3, label: '😐', description: 'Neutral' },
    { value: 4, label: '😊', description: 'Happy' },
    { value: 5, label: '😄', description: 'Very Happy' },
];

interface FormMoodSelectorProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    helperText?: string;
    showLabels?: boolean;
}

export default function FormMoodSelector<T extends FieldValues>({
    name,
    control,
    label,
    rules,
    helperText,
    showLabels = true,
}: FormMoodSelectorProps<T>) {
    const styles = useStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.s,
        },
        moodContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: theme.spacing.s,
        },
        moodOption: {
            alignItems: 'center',
            padding: theme.spacing.s,
            borderRadius: theme.shape.radius.m,
            width: 60,
        },
        moodOptionSelected: {
            backgroundColor: theme.colors.primaryLight,
        },
        emoji: {
            fontSize: 32,
            marginBottom: theme.spacing.xs,
        },
        moodLabel: {
            marginTop: theme.spacing.xs,
            fontSize: theme.typography.fontSize.xs,
            textAlign: 'center',
        },
        helperText: {
            marginTop: 4,
        },
    }));

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    {label && (
                        <Typography variant="body1" style={styles.label}>
                            {label}
                        </Typography>
                    )}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.moodContainer}
                    >
                        {MOOD_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.moodOption,
                                    value === option.value && styles.moodOptionSelected,
                                ]}
                                onPress={() => onChange(option.value)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.emoji}>{option.label}</Text>
                                {showLabels && (
                                    <Typography style={styles.moodLabel}>
                                        {option.description}
                                    </Typography>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

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