// src/components/form/FormRichTextarea.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Icon } from '../common/Icon';
import FormErrorMessage from './FormErrorMessage';

interface FormRichTextareaProps<T extends FieldValues> {
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

// Basic formatting options
type FormatOption = 'bold' | 'italic' | 'underline' | 'bullet' | 'heading';

export default function FormRichTextarea<T extends FieldValues>({
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
}: FormRichTextareaProps<T>) {
    const [isFocused, setIsFocused] = useState(false);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const inputRef = useRef<TextInput>(null);

    const styles = useStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        formatToolbar: {
            flexDirection: 'row',
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.components.inputs.radius,
            borderTopRightRadius: theme.components.inputs.radius,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: theme.components.inputs.border,
            padding: theme.spacing.xs,
        },
        formatButton: {
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
        },
        formatButtonActive: {
            backgroundColor: theme.colors.primaryLight,
        },
        inputWrapper: {
            backgroundColor: theme.components.inputs.background,
            borderWidth: 1,
            borderColor: theme.components.inputs.border,
            borderRadius: theme.components.inputs.radius,
            ...(isFocused && {
                borderColor: theme.components.inputs.focusBorder,
            }),
            // For toolbar, only round the bottom if toolbar is visible
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
        },
        input: {
            padding: theme.spacing.m,
            color: theme.components.inputs.text,
            fontSize: theme.typography.fontSize.m,
            textAlignVertical: 'top',
        },
        inputError: {
            borderColor: theme.colors.error,
        },
        charCounter: {
            alignSelf: 'flex-end',
            marginTop: 4,
        },
        helperText: {
            marginTop: 4,
        },
    }));

    const handleContentSizeChange = (event: any) => {
        if (autoGrow) {
            const contentHeight = event.nativeEvent.contentSize.height;
            setHeight(Math.min(contentHeight, maxHeight));
        }
    };

    // Format text by wrapping it with markdown syntax
    const formatText = (
        inputText: string,
        selectionStart: number,
        selectionEnd: number,
        format: FormatOption
    ) => {
        let formattedText = inputText;
        let newCursorPosition = selectionEnd;

        const selectedText = inputText.substring(selectionStart, selectionEnd);
        let replacementText = '';

        // Apply markdown formatting
        switch (format) {
            case 'bold':
                replacementText = `**${selectedText}**`;
                newCursorPosition = selectionStart + replacementText.length;
                break;
            case 'italic':
                replacementText = `*${selectedText}*`;
                newCursorPosition = selectionStart + replacementText.length;
                break;
            case 'underline':
                replacementText = `_${selectedText}_`;
                newCursorPosition = selectionStart + replacementText.length;
                break;
            case 'bullet':
                // If it's already a bullet point, remove it
                if (selectedText.startsWith('• ')) {
                    replacementText = selectedText.substring(2);
                } else {
                    replacementText = `• ${selectedText}`;
                }
                newCursorPosition = selectionStart + replacementText.length;
                break;
            case 'heading':
                // If it's at the start of a line, add a heading
                const lineStart = inputText.lastIndexOf('\n', selectionStart - 1) + 1;
                if (lineStart === selectionStart || selectionStart === 0) {
                    replacementText = `# ${selectedText}`;
                    newCursorPosition = selectionStart + 2;
                } else {
                    // Insert on a new line
                    replacementText = `\n# ${selectedText}`;
                    newCursorPosition = selectionStart + 3;
                }
                break;
        }

        // Replace the selected text with the formatted text
        formattedText =
            inputText.substring(0, selectionStart) +
            replacementText +
            inputText.substring(selectionEnd);

        return { text: formattedText, cursorPosition: newCursorPosition };
    };

    // Render format buttons
    const renderFormatButtons = (
        value: string,
        onChange: (text: string) => void
    ) => {
        const applyFormat = (format: FormatOption) => {
            if (!inputRef.current) return;

            // Get current selection
            const selectionStart = inputRef.current.props.selection?.start || 0;
            const selectionEnd = inputRef.current.props.selection?.end || 0;

            // Format the text
            const { text, cursorPosition } = formatText(
                value,
                selectionStart,
                selectionEnd,
                format
            );

            // Update the input
            onChange(text);

            // Focus the input and restore selection
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.setSelection(cursorPosition, cursorPosition);
                }
            }, 10);
        };

        const formatOptions: Array<{ name: FormatOption; icon: string }> = [
            { name: 'bold', icon: 'bold' },
            { name: 'italic', icon: 'italic' },
            { name: 'underline', icon: 'underline' },
            { name: 'bullet', icon: 'list' },
            { name: 'heading', icon: 'heading' },
        ];

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.formatToolbar}
            >
                {formatOptions.map((option) => (
                    <TouchableOpacity
                        key={option.name}
                        style={styles.formatButton}
                        onPress={() => applyFormat(option.name)}
                    >
                        <Icon
                            name={option.icon as any}
                            width={20}
                            height={20}
                            color={styles.input.color}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    {label && (
                        <Typography variant="body1" style={styles.label}>
                            {label}
                        </Typography>
                    )}

                    {renderFormatButtons(value, onChange)}

                    <View style={[styles.inputWrapper, error && styles.inputError]}>
                        <TextInput
                            ref={inputRef}
                            style={[
                                styles.input,
                                height ? { height } : { minHeight: 20 * numberOfLines },
                            ]}
                            value={value}
                            onChangeText={(text) => {
                                if (maxLength && text.length > maxLength) {
                                    return;
                                }
                                onChange(text);
                            }}
                            onBlur={() => {
                                setIsFocused(false);
                                onBlur();
                            }}
                            onFocus={() => setIsFocused(true)}
                            maxLength={maxLength}
                            placeholder={placeholder}
                            multiline
                            numberOfLines={numberOfLines}
                            textAlignVertical="top"
                            onContentSizeChange={handleContentSizeChange}
                            // Allow selection range to be tracked for formatting
                            selection={undefined}
                        />
                    </View>

                    {showCharCount && maxLength && (
                        <Typography
                            variant="caption"
                            style={styles.charCounter}
                            color={
                                value && typeof value === 'string' && value.length === maxLength
                                    ? 'error'
                                    : 'secondary'
                            }
                        >
                            {value && typeof value === 'string' ? value.length : 0}/{maxLength}
                        </Typography>
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