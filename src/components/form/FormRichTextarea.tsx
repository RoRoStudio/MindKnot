// src/components/form/FormRichTextarea.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
    Keyboard,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Icon, IconName } from '../common/Icon';
import FormErrorMessage from './FormErrorMessage';
import { RichEditor } from 'react-native-pell-rich-editor';
import { useTheme } from '../../contexts/ThemeContext';

// Define the editor modes
export type EditorMode = 'full' | 'light' | 'optional';

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
}

export default function FormRichTextarea<T extends FieldValues>({
    name,
    control,
    label,
    placeholder = 'Enter text...',
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
    const [isResizing, setIsResizing] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const editorRef = useRef<RichEditor>(null);
    const { theme } = useTheme();

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
            overflow: 'hidden',
        },
        toolbarScroll: {
            flexDirection: 'row',
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
        editorContainer: {
            borderWidth: 1,
            borderColor: theme.components.inputs.border,
            borderRadius: theme.components.inputs.radius,
            ...(isFocused && {
                borderColor: theme.components.inputs.focusBorder,
            }),
            // For toolbar, only round the bottom if toolbar is visible
            borderTopLeftRadius: useRichEditor ? 0 : theme.components.inputs.radius,
            borderTopRightRadius: useRichEditor ? 0 : theme.components.inputs.radius,
            borderBottomLeftRadius: resizable ? 0 : theme.components.inputs.radius,
            borderBottomRightRadius: resizable ? 0 : theme.components.inputs.radius,
            borderBottomWidth: resizable ? 0 : 1,
            backgroundColor: theme.components.inputs.background,
            overflow: 'hidden',
        },
        editorError: {
            borderColor: theme.colors.error,
        },
        richEditor: {
            minHeight: actualMinHeight,
            maxHeight: actualMaxHeight,
        },
        plainTextInput: {
            padding: theme.spacing.m,
            color: theme.components.inputs.text,
            fontSize: theme.typography.fontSize.m,
            textAlignVertical: 'top',
            minHeight: actualMinHeight,
            maxHeight: actualMaxHeight,
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

    // Map editor actions to icon names
    const formatActions = [
        { action: 'bold', icon: 'bold', tooltip: 'Bold' },
        { action: 'italic', icon: 'italic', tooltip: 'Italic' },
        { action: 'insertBulletsList', icon: 'list', tooltip: 'Bullet List' },
        { action: 'insertOrderedList', icon: 'list', tooltip: 'Ordered List' },
        { action: 'insertLink', icon: 'link', tooltip: 'Insert Link' },
        { action: 'keyboard', icon: 'keyboard', tooltip: 'Show/Hide Keyboard' },
        { action: 'strikeThrough', icon: 'strikethrough', tooltip: 'Strikethrough' },
        { action: 'underline', icon: 'underline', tooltip: 'Underline' },
        { action: 'removeFormat', icon: 'x', tooltip: 'Remove Formatting' },
        { action: 'insertCheckboxList', icon: 'square-check', tooltip: 'Checkbox List' },
        { action: 'undo', icon: 'undo', tooltip: 'Undo' },
        { action: 'redo', icon: 'redo', tooltip: 'Redo' }
    ];

    // Get icons based on editor mode
    const getFormatActions = () => {
        // Light mode has fewer options
        if (editorMode === 'light') {
            return formatActions.slice(0, 4); // Just bold, italic, bullets, ordered lists
        }
        return formatActions; // Full set for full mode
    };

    // Function to handle formatting commands
    const handleFormat = (action: string) => {
        if (editorRef.current) {
            // Call the proper method directly on the editor
            editorRef.current.commandDOM(action);
            // Focus after executing the command
            setTimeout(() => {
                editorRef.current?.focusContentEditor();
            }, 100);
        }
    };

    // Create custom formatting toolbar
    const renderFormatToolbar = () => {
        return (
            <View style={styles.formatToolbar}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.toolbarScroll}
                >
                    {getFormatActions().map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.formatButton}
                            onPress={() => handleFormat(item.action)}
                            accessibilityLabel={item.tooltip}
                        >
                            <Icon
                                name={item.icon as IconName}
                                width={20}
                                height={20}
                                color={theme.colors.textPrimary}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
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
                        name={useRichEditor ? 'file-text' : 'type'}
                        width={16}
                        height={16}
                        color={theme.colors.primary}
                    />
                    <Typography variant="body2" style={styles.toggleText}>
                        {useRichEditor ? 'Use simple editor' : 'Use rich editor'}
                    </Typography>
                </TouchableOpacity>
            </View>
        );
    };

    // Handle HTML content changes
    const handleContentChange = (html: string, onChange: (value: string) => void) => {
        // Check character limit
        if (maxLength) {
            // Strip HTML to count characters
            const plainText = html.replace(/<[^>]*>/g, '');
            setCharCount(plainText.length);

            if (plainText.length > maxLength) {
                // Too many characters, don't update
                return;
            }
        }

        onChange(html);
    };

    // Helper to ensure the value is always a valid string
    const ensureStringValue = (value: any): string => {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'string') {
            return value;
        }
        // If it's an array or object, convert to empty string to avoid type errors
        return '';
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

                    {useRichEditor && renderFormatToolbar()}

                    <View style={[
                        styles.editorContainer,
                        error && styles.editorError
                    ]}>
                        {useRichEditor ? (
                            // Rich Text Editor
                            <RichEditor
                                ref={editorRef}
                                initialContentHTML={ensureStringValue(value)}
                                onChange={(content) => handleContentChange(content, onChange)}
                                onBlur={() => {
                                    setIsFocused(false);
                                    onBlur();
                                }}
                                onFocus={() => setIsFocused(true)}
                                placeholder={placeholder}
                                initialHeight={actualMinHeight}
                                editorStyle={{
                                    backgroundColor: theme.components.inputs.background,
                                    color: theme.components.inputs.text,
                                    placeholderColor: theme.components.inputs.placeholder,
                                    contentCSSText: `
                                        font-family: System; 
                                        font-size: ${theme.typography.fontSize.m}px;
                                        padding: ${theme.spacing.m}px;
                                    `
                                }}
                                containerStyle={styles.richEditor}
                            />
                        ) : (
                            // Plain Text Input
                            <TextInput
                                style={[
                                    styles.plainTextInput,
                                    { height: Math.max(actualMinHeight, height) }
                                ]}
                                value={value}
                                onChangeText={(text) => {
                                    if (maxLength && text.length > maxLength) {
                                        return;
                                    }
                                    onChange(text);
                                    setCharCount(text.length);
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
                                onContentSizeChange={(event) => {
                                    if (autoGrow && !isResizing) {
                                        const contentHeight = event.nativeEvent.contentSize.height;
                                        setHeight(Math.min(Math.max(contentHeight, actualMinHeight), actualMaxHeight));
                                    }
                                }}
                            />
                        )}
                    </View>

                    {/* Resize handle */}
                    {resizable && (
                        <View style={styles.resizeHandle}>
                            <View style={styles.resizeBar} />
                        </View>
                    )}

                    {/* Character counter */}
                    {showCharCount && maxLength && (
                        <Typography
                            variant="caption"
                            style={styles.charCounter}
                            color={charCount === maxLength ? 'error' : 'secondary'}
                        >
                            {charCount}/{maxLength}
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