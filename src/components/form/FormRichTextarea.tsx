// src/components/form/FormRichTextarea.tsx
// NOTE: This is a placeholder implementation of a rich text editor with visual formatting.
// We need to integrate with a WYSIWYG library like:
// - react-native-pell-rich-editor

// That library provides true visual formatting (bold, italic, etc.) rather than just showing the formatting buttons.
// The current implementation only shows the UI elements but alerts when formatting would be applied which should be deleted once the full implementation is done.

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Pressable,
    PanResponder,
    StyleSheet,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Icon, IconName } from '../common/Icon';
import FormErrorMessage from './FormErrorMessage';

// Define the editor modes
export type EditorMode = 'full' | 'light' | 'optional';

// All possible formatting options
export type FormatOption = 'bold' | 'italic' | 'underline' | 'bullet' | 'heading' | 'quote';

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
    minHeight?: number;
    editorMode?: EditorMode;
    resizable?: boolean;
    // Optionally provide format options to enable (defaults to all for full mode)
    formatOptions?: FormatOption[];
}

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
    maxHeight = 300,
    minHeight = 100,
    editorMode = 'full',
    resizable = true,
    formatOptions,
}: FormRichTextareaProps<T>) {
    // Dynamic defaults based on editor mode
    const defaultNumberOfLines = editorMode === 'light' ? 2 : 4;
    const defaultMinHeight = editorMode === 'light' ? 80 : 100;
    const defaultMaxHeight = editorMode === 'light' ? 150 : 300;
    const actualNumberOfLines = numberOfLines || defaultNumberOfLines;
    const actualMinHeight = minHeight || defaultMinHeight;
    const actualMaxHeight = maxHeight || defaultMaxHeight;

    const [isFocused, setIsFocused] = useState(false);
    const [useRichEditor, setUseRichEditor] = useState(editorMode !== 'optional');
    const [height, setHeight] = useState<number>(actualMinHeight);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Reset useRichEditor when editorMode changes
    useEffect(() => {
        setUseRichEditor(editorMode !== 'optional');
    }, [editorMode]);

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
            // For toolbar, only round the bottom if toolbar is visible and not resizable
            borderTopLeftRadius: useRichEditor ? 0 : theme.components.inputs.radius,
            borderTopRightRadius: useRichEditor ? 0 : theme.components.inputs.radius,
            borderBottomLeftRadius: resizable ? 0 : theme.components.inputs.radius,
            borderBottomRightRadius: resizable ? 0 : theme.components.inputs.radius,
            borderBottomWidth: resizable ? 0 : 1,
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
        resizeHandle: {
            height: 24,
            width: '100%',
            borderBottomLeftRadius: theme.components.inputs.radius,
            borderBottomRightRadius: theme.components.inputs.radius,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: isFocused
                ? theme.components.inputs.focusBorder
                : theme.components.inputs.border,
            padding: 0,
            margin: 0,
        },
        resizeBar: {
            height: 4,
            width: 40,
            backgroundColor: isFocused
                ? theme.components.inputs.focusBorder
                : theme.colors.border,
            borderRadius: 2,
            marginTop: 2,
        },
    }));

    // Create the pan responder for resizing
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            setIsResizing(true);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        },
        onPanResponderMove: (_, gestureState) => {
            const newHeight = height + gestureState.dy;
            if (newHeight >= actualMinHeight && newHeight <= actualMaxHeight) {
                setHeight(newHeight);
            }
        },
        onPanResponderRelease: () => {
            setIsResizing(false);
        },
    });

    const handleContentSizeChange = (event: any) => {
        if (autoGrow && !isResizing) {
            const contentHeight = event.nativeEvent.contentSize.height;
            setHeight(Math.min(Math.max(contentHeight, actualMinHeight), actualMaxHeight));
        }
    };

    // Handle selection change
    const handleSelectionChange = (event: any) => {
        setSelection(event.nativeEvent.selection);
    };

    // Apply formatting to text (this would need to integrate with a WYSIWYG library in a real implementation)
    // For this example, we'll simulate it by showing buttons that can apply simple inline styles
    const applyFormatting = (format: FormatOption, value: string, onChange: (text: string) => void) => {
        // In a real implementation, you would integrate with a WYSIWYG library
        // Here we'll just demonstrate the button UI without actual formatting

        if (!inputRef.current) return;

        // Focus input to prepare for formatting
        inputRef.current.focus();

        // Show that the button was clicked (in a real implementation, this would apply formatting)
        console.log(`Applied ${format} formatting`);

        // Simulate formatting by adding a tag to indicate what was done
        // In a real implementation, this would be replaced with actual visual formatting
        const selectionStart = selection.start;
        const selectionEnd = selection.end;
        const selectedText = value.substring(selectionStart, selectionEnd);

        if (selectedText.length === 0) {
            // No text selected, just focus
            return;
        }

        // In a real implementation with a WYSIWYG library, you would apply formats directly
        // This is just a placeholder to show the UI functionality
        alert(`Applied ${format} formatting to "${selectedText}"`);
    };

    // Get the appropriate format options based on editor mode
    const getFormatOptions = (): Array<{ name: FormatOption; icon: IconName; tooltip: string }> => {
        // If custom format options are provided, use those
        if (formatOptions) {
            return formatOptions.map(option => {
                switch (option) {
                    case 'bold': return { name: 'bold', icon: 'bold', tooltip: 'Bold' };
                    case 'italic': return { name: 'italic', icon: 'italic', tooltip: 'Italic' };
                    case 'underline': return { name: 'underline', icon: 'underline', tooltip: 'Underline' };
                    case 'bullet': return { name: 'bullet', icon: 'list', tooltip: 'Bullet List' };
                    case 'heading': return { name: 'heading', icon: 'heading', tooltip: 'Heading' };
                    case 'quote': return { name: 'quote', icon: 'file-text', tooltip: 'Quote' };
                    default: return { name: 'bold', icon: 'bold', tooltip: 'Bold' };
                }
            });
        }

        // Default options based on mode
        if (editorMode === 'light') {
            return [
                { name: 'bold', icon: 'bold', tooltip: 'Bold' },
                { name: 'italic', icon: 'italic', tooltip: 'Italic' },
            ];
        }

        // Full mode
        return [
            { name: 'bold', icon: 'bold', tooltip: 'Bold' },
            { name: 'italic', icon: 'italic', tooltip: 'Italic' },
            { name: 'underline', icon: 'underline', tooltip: 'Underline' },
            { name: 'bullet', icon: 'list', tooltip: 'Bullet List' },
            { name: 'heading', icon: 'heading', tooltip: 'Heading' },
            { name: 'quote', icon: 'file-text', tooltip: 'Quote' },
        ];
    };

    // Render format buttons
    const renderFormatButtons = (
        value: string,
        onChange: (text: string) => void
    ) => {
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.formatToolbar}
            >
                {getFormatOptions().map((option) => (
                    <TouchableOpacity
                        key={option.name}
                        style={[
                            styles.formatButton,
                            // This would be based on current selection formatting in a real implementation
                        ]}
                        onPress={() => applyFormatting(option.name, value, onChange)}
                    >
                        <Icon
                            name={option.icon}
                            width={20}
                            height={20}
                            color={styles.input.color}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    // Render toggle button for optional rich editor
    const renderToggleButton = () => {
        if (editorMode !== 'optional') return null;

        return (
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

                    {renderToggleButton()}

                    {useRichEditor && renderFormatButtons(value, onChange)}

                    <View style={[styles.inputWrapper, error && styles.inputError]}>
                        <TextInput
                            ref={inputRef}
                            style={[
                                styles.input,
                                { height: height },
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
                            numberOfLines={actualNumberOfLines}
                            textAlignVertical="top"
                            onContentSizeChange={handleContentSizeChange}
                            onSelectionChange={handleSelectionChange}
                        />
                    </View>

                    {resizable && (
                        <Pressable
                            style={styles.resizeHandle}
                            {...panResponder.panHandlers}
                        >
                            <View style={styles.resizeBar} />
                        </Pressable>
                    )}

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