import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Icon } from '../common/Icon';
import FormErrorMessage from './FormErrorMessage';
import FormRichTextarea from './FormRichTextarea';
import FormTextarea from './FormTextarea';

interface FormOptionalRichTextareaProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    rules?: Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
    showCharCount?: boolean;
    maxLength?: number;
    helperText?: string;
    numberOfLines?: number;
    autoGrow?: boolean;
    maxHeight?: number;
}

export default function FormOptionalRichTextarea<T extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    rules,
    showCharCount,
    maxLength,
    helperText,
    numberOfLines = 4,
    autoGrow = true,
    maxHeight = 200,
}: FormOptionalRichTextareaProps<T>) {
    const [useRichEditor, setUseRichEditor] = useState(false);

    const styles = useStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        toggleContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        toggleButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.s,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        toggleText: {
            marginLeft: theme.spacing.xs,
            fontSize: theme.typography.fontSize.s,
        },
    }));

    return (
        <View style={styles.container}>
            {label && (
                <Typography variant="body1" style={styles.label}>
                    {label}
                </Typography>
            )}

            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setUseRichEditor(!useRichEditor)}
                >
                    <Icon
                        name={useRichEditor ? 'file-text' : 'list'}
                        width={16}
                        height={16}
                    />
                    <Typography variant="body2" style={styles.toggleText}>
                        {useRichEditor ? 'Use simple editor' : 'Use rich editor'}
                    </Typography>
                </TouchableOpacity>
            </View>

            {useRichEditor ? (
                <FormRichTextarea
                    name={name}
                    control={control}
                    placeholder={placeholder}
                    rules={rules}
                    showCharCount={showCharCount}
                    maxLength={maxLength}
                    helperText={helperText}
                    numberOfLines={numberOfLines}
                    autoGrow={autoGrow}
                    maxHeight={maxHeight}
                />
            ) : (
                <FormTextarea
                    name={name}
                    control={control}
                    placeholder={placeholder}
                    rules={rules}
                    showCharCount={showCharCount}
                    maxLength={maxLength}
                    helperText={helperText}
                    numberOfLines={numberOfLines}
                    autoGrow={autoGrow}
                    maxHeight={maxHeight}
                />
            )}
        </View>
    );
} 