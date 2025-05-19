// src/components/form/FormRichTextarea.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import {
    Control,
    Controller,
    FieldValues,
    Path,
    RegisterOptions,
} from 'react-hook-form';
import { Typography } from '../atoms/Typography';
import FormErrorMessage from './FormErrorMessage';
import { useTheme } from '../../contexts/ThemeContext';
import {
    RichText,
    Toolbar,
    useEditorBridge,
    DEFAULT_TOOLBAR_ITEMS
} from '@10play/tentap-editor';

interface FormRichTextareaProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    rules?: Omit<
        RegisterOptions<T, Path<T>>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
    >;
    showCharCount?: boolean;
    maxLength?: number;
    helperText?: string;
    minimumHeight?: number;
    adaptiveHeight?: boolean;
}

// Remove code-related actions from toolbar
const EXCLUDED_ACTIONS = [
    'codeBlock',
    'code',
    'insertCodeBlock',
    'setCodeBlock',
    'setCode',
];

export default function FormRichTextarea<T extends FieldValues>({
    name,
    control,
    label,
    placeholder = 'Enter text...',
    rules,
    showCharCount,
    maxLength,
    helperText,
    minimumHeight = 100,
    adaptiveHeight = true,
}: FormRichTextareaProps<T>) {
    console.log("[FormRichTextarea] Rendering component with name:", name);

    const { theme } = useTheme();
    const [charCount, setCharCount] = useState(0);

    // Filter toolbar items
    const toolbarItems = DEFAULT_TOOLBAR_ITEMS.filter(item => {
        if (typeof item === 'string') {
            return !EXCLUDED_ACTIONS.includes(item);
        }
        if (item && typeof item === 'object' && 'name' in item) {
            return !EXCLUDED_ACTIONS.includes(item.name as string);
        }
        return true;
    });

    // Setup styles
    const styles = StyleSheet.create({
        container: {
            flex: adaptiveHeight ? 0 : 1,
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        editorContainer: {
            flex: adaptiveHeight ? 0 : 1,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.components.inputs.radius,
            minHeight: minimumHeight,
        },
        editor: {
            flex: 1,
            padding: theme.spacing.m,
            minHeight: minimumHeight,
            backgroundColor: 'transparent',
        },
        charCounter: {
            alignSelf: 'flex-end',
            fontSize: 10,
            color: theme.colors.textSecondary,
            marginTop: 4,
            paddingHorizontal: theme.spacing.s,
        },
        helperText: {
            paddingHorizontal: theme.spacing.s,
            marginTop: 4,
        },
        toolbarContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
        }
    });

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => {
                // Create the editor with basic configuration
                const editor = useEditorBridge({
                    autofocus: false,
                    avoidIosKeyboard: Platform.OS === 'ios',
                    initialContent: value || '',
                    onChange: () => {
                        if (editor && editor.getHTML) {
                            editor.getHTML()
                                .then((html: string) => {
                                    onChange(html);
                                    if (showCharCount && maxLength) {
                                        // Remove HTML tags for character count
                                        const plainText = html.replace(/<[^>]*>/g, '').trim();
                                        setCharCount(plainText.length);
                                    }
                                })
                                .catch(error => {
                                    console.error('[FormRichTextarea] Error getting editor HTML:', error);
                                });
                        }
                    }
                });

                return (
                    <View style={styles.container}>
                        {label && (
                            <Typography style={styles.label}>
                                {label}
                            </Typography>
                        )}

                        <View style={styles.editorContainer}>
                            <RichText
                                editor={editor}
                                style={styles.editor}
                            />

                            {showCharCount && maxLength && (
                                <Typography style={styles.charCounter}>
                                    {charCount}/{maxLength}
                                </Typography>
                            )}
                        </View>

                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.toolbarContainer}
                        >
                            <Toolbar editor={editor} items={toolbarItems} />
                        </KeyboardAvoidingView>

                        <FormErrorMessage message={error?.message} visible={!!error} />

                        {!error && helperText && (
                            <Typography
                                variant="caption"
                                color="secondary"
                                style={styles.helperText}
                            >
                                {helperText}
                            </Typography>
                        )}
                    </View>
                );
            }}
        />
    );
}
