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
    Platform,
    Button,
} from 'react-native';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../atoms/Typography';
import { Icon, IconName } from '../atoms/Icon';
import FormErrorMessage from './FormErrorMessage';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { useTheme } from '../../contexts/ThemeContext';

// Define the editor modes
export type EditorMode = 'full' | 'light' | 'optional';

// Update the RichTextValue interface to use a special format that is compatible with string storage
interface RichTextValue {
    _text: string;  // Plain text for validation
    _html: string;  // HTML for display
    toString(): string; // For compatibility with string operations
}

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

    const [localActiveFormats, setLocalActiveFormats] = useState<Record<string, boolean>>({
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        insertUnorderedList: false,
        insertOrderedList: false,
    });
    const [isFocused, setIsFocused] = useState(false);
    const [useRichEditor, setUseRichEditor] = useState(editorMode !== 'optional');
    const [height, setHeight] = useState<number>(actualMinHeight);
    const [isResizing, setIsResizing] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [internalHtml, setInternalHtml] = useState<string>('');
    const [plainText, setPlainText] = useState<string>(''); // Store plain text separately
    const editorRef = useRef<RichEditor>(null);
    const { theme } = useTheme();

    // Reset useRichEditor when editorMode changes
    useEffect(() => {
        setUseRichEditor(editorMode !== 'optional');
    }, [editorMode]);

    // Improve editor initialization with stronger fixes
    useEffect(() => {
        // Ensure editor is properly initialized and focusable
        if (editorRef.current) {
            // Give it a moment to fully initialize
            setTimeout(() => {
                if (useRichEditor) {
                    editorRef.current?.commandDOM(`
                        // Completely reset and reinitialize the editor
                        document.body.style.userSelect = 'text';
                        document.body.style.webkitUserSelect = 'text';
                        document.body.style.MozUserSelect = 'text';
                        document.body.contentEditable = 'true';
                        document.documentElement.style.webkitTouchCallout = 'default';
                        document.documentElement.style.webkitUserSelect = 'text';
                        
                        // Force proper line handling
                        const styleTag = document.createElement('style');
                        styleTag.innerHTML = \`
                            body {
                                line-height: 1.5 !important;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            p {
                                margin-top: 0 !important;
                                margin-bottom: 0.8em !important;
                                min-height: 1em !important;
                            }
                            div {
                                margin-bottom: 0.8em !important;
                                min-height: 1em !important;
                            }
                            br {
                                display: block !important;
                                content: "" !important;
                                margin-top: 0.8em !important;
                                line-height: 1.5 !important;
                            }
                        \`;
                        document.head.appendChild(styleTag);
                        
                        // Force keyboard behavior
                        document.addEventListener('keydown', function(e) {
                            if (e.key === 'Enter' || e.keyCode === 13) {
                                // Manually insert a paragraph break
                                if (document.queryCommandSupported('insertParagraph')) {
                                    document.execCommand('insertParagraph', false, null);
                                } else {
                                    document.execCommand('insertHTML', false, '<br><br>');
                                }
                                e.preventDefault();
                            }
                        });
                    `);
                }
            }, 500);
        }
    }, [useRichEditor, editorRef.current]);

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
        // More prominent active state
        activeFormatIcon: {
            color: theme.colors.primary,
        },
        activeFormatButton: {
            backgroundColor: theme.colors.primaryLight,
            borderWidth: 1,
            borderColor: theme.colors.primary,
        },
        // Add a manual sync button
        syncButton: {
            alignSelf: 'flex-end',
            marginTop: 5,
            marginBottom: 5,
            padding: 8,
            backgroundColor: theme.colors.accent,
            borderRadius: theme.shape.radius.s,
        },
        syncButtonText: {
            color: theme.colors.textPrimary,
            fontSize: 12,
        }
    }));

    // Map editor actions to icon names
    const formatActions = [
        // Text styling (most commonly used)
        { action: 'bold', icon: 'bold', tooltip: 'Bold' },
        { action: 'italic', icon: 'italic', tooltip: 'Italic' },
        { action: 'underline', icon: 'underline', tooltip: 'Underline' },
        { action: 'strikethrough', icon: 'strikethrough', tooltip: 'Strikethrough' },

        // List formatting
        { action: 'insertUnorderedList', icon: 'list', tooltip: 'Bullet List' },
        { action: 'insertOrderedList', icon: 'list-ordered', tooltip: 'Ordered List' },
        { action: 'insertHTML', icon: 'square-check', tooltip: 'Checkbox List', param: '<ul style="list-style-type: none; margin-left: 0; padding-left: 20px;"><li><input type="checkbox"> New item</li></ul>' },

        // Additional formatting
        { action: 'createLink', icon: 'link', tooltip: 'Insert Link', param: 'https://' },
        { action: 'removeFormat', icon: 'x', tooltip: 'Remove Formatting' },

        // Undo/Redo
        { action: 'undo', icon: 'undo', tooltip: 'Undo' },
        { action: 'redo', icon: 'redo', tooltip: 'Redo' }
    ];

    // Get icons based on editor mode
    const getFormatActions = () => {
        // Light mode has fewer options
        if (editorMode === 'light') {
            // Just the basic formatting options
            return formatActions.filter(action =>
                ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'].includes(action.action)
            );
        }
        return formatActions; // Full set for full mode
    };

    // Function to handle formatting commands with direct state management
    const handleFormat = (action: string, param: string | null = null) => {
        if (editorRef.current) {
            // Directly toggle the format state in our local state
            if (['bold', 'italic', 'underline', 'strikethrough', 'insertUnorderedList', 'insertOrderedList'].includes(action)) {
                setLocalActiveFormats(prev => ({
                    ...prev,
                    [action]: !prev[action]
                }));
            }

            if (action === 'insertHTML' && param) {
                // Insert HTML content (like for checkbox list)
                editorRef.current.commandDOM(`document.execCommand('${action}', false, '${param}')`);
            } else if (action === 'createLink' && param) {
                // Handle link insertion with prompt
                editorRef.current.commandDOM(`
                    var url = prompt('Enter a URL:', '${param}');
                    if (url) {
                        document.execCommand('${action}', false, url);
                    }
                `);
            } else {
                // Standard execCommand
                editorRef.current.commandDOM(`document.execCommand('${action}', false, null)`);
            }

            // Focus after executing the command
            setTimeout(() => {
                editorRef.current?.focusContentEditor();
            }, 100);
        }
    };

    // Create custom formatting toolbar with more explicit active states
    const renderFormatToolbar = () => {
        return (
            <View style={styles.formatToolbar}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.toolbarScroll}
                >
                    {getFormatActions().map((item, index) => {
                        const isActive = localActiveFormats[item.action] === true;
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.formatButton,
                                    isActive && styles.activeFormatButton
                                ]}
                                onPress={() => handleFormat(item.action, item.param || null)}
                                accessibilityLabel={item.tooltip}
                            >
                                <Icon
                                    name={item.icon as IconName}
                                    width={20}
                                    height={20}
                                    color={isActive
                                        ? theme.colors.primary
                                        : theme.colors.textPrimary}
                                />
                            </TouchableOpacity>
                        );
                    })}
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

    // Simplified content change handler that doesn't rely on message passing
    const handleContentChange = (html: string, onChange: (value: any) => void) => {
        try {
            if (html === null || html === undefined) {
                console.log('Received null/undefined content');
                return;
            }

            // Store HTML content
            setInternalHtml(html);

            // Extract plain text from HTML by stripping tags
            const extractedText = html.replace(/<[^>]*>/g, '').trim();
            setPlainText(extractedText);

            // Common empty HTML patterns
            const emptyPatterns = [
                '', '<p></p>', '<br>', '<p><br></p>',
                '<div></div>', '<div><br></div>',
                '<p> </p>', '<p>&nbsp;</p>'
            ];

            const isEmpty = !extractedText || emptyPatterns.includes(html.trim());

            // Update character count
            if (maxLength) {
                setCharCount(extractedText.length);
                if (extractedText.length > maxLength) {
                    return; // Too many characters
                }
            }

            // Log content status
            console.log(`Content status: ${isEmpty ? 'empty' : 'has content'}, Plain text length: ${extractedText.length}`);

            // Create a value that will work with form validation and database
            if (isEmpty) {
                onChange(''); // Empty string for empty content
            } else {
                // Use a simple string value instead of complex object
                // This ensures form validation works properly
                onChange(extractedText);
            }
        } catch (e) {
            console.log('Error in handleContentChange:', e);
            // Send empty if error occurs
            onChange('');
        }
    };

    // Simple helper to ensure value is a string
    const ensureStringValue = (value: any): string => {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value); // Convert anything to string
    };

    // Function to manually synchronize content
    const syncContent = (onChange: (value: any) => void) => {
        try {
            if (editorRef.current) {
                // Get content HTML from the editor
                editorRef.current.getContentHtml().then(html => {
                    if (html) {
                        setInternalHtml(html);
                        // Extract plain text
                        const text = html.replace(/<[^>]*>/g, '').trim();
                        setPlainText(text);

                        if (text) {
                            console.log('Manual sync successful, content length:', text.length);
                            onChange(text);
                        } else {
                            console.log('Manual sync found empty content');
                            onChange('');
                        }
                    }
                }).catch(e => {
                    console.log('Error getting content in manual sync:', e);
                });
            }
        } catch (e) {
            console.log('Error in manual sync:', e);
        }
    };

    // Initialize the editor with basic settings
    const handleEditorInitialized = () => {
        console.log('Rich Editor initialized');
        if (editorRef.current) {
            // Basic setup with strong styling rules
            editorRef.current.commandDOM(`
                document.body.style.fontFamily = 'System';
                document.body.style.fontSize = '${theme.typography.fontSize.m}px';
                document.body.style.padding = '${theme.spacing.m}px';
                document.body.style.lineHeight = '1.5';
                document.body.style.color = '${theme.components.inputs.text}';
                
                // Fix paragraph spacing
                const style = document.createElement('style');
                style.innerHTML = 'p { margin: 0 0 8px 0; } br { display: block; margin-bottom: 8px; }';
                document.head.appendChild(style);
            `);
        }
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
                // Debug the current value when there's an error
                if (error) {
                    console.log(`Form error for ${name}:`, error.message);
                    console.log(`Current value:`, value);
                    console.log(`Current HTML:`, internalHtml);
                    console.log(`Current plain text:`, plainText);
                }

                return (
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
                                    ref={(r) => {
                                        // Store editor ref
                                        editorRef.current = r;
                                        // Pass to react-hook-form
                                        if (typeof ref === 'function') ref(r);
                                    }}
                                    initialContentHTML={ensureStringValue(value)}
                                    onChange={(content) => handleContentChange(content, onChange)}
                                    onBlur={() => {
                                        setIsFocused(false);
                                        // Sync content on blur for safety
                                        syncContent(onChange);
                                        onBlur();
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    placeholder={placeholder}
                                    initialHeight={actualMinHeight}
                                    initialFocus={false}
                                    pasteAsPlainText={false}
                                    useContainer={false}
                                    editorInitializedCallback={handleEditorInitialized}
                                    editorStyle={{
                                        backgroundColor: theme.components.inputs.background,
                                        color: theme.components.inputs.text,
                                        placeholderColor: theme.components.inputs.placeholder,
                                        contentCSSText: `
                                            font-family: System; 
                                            font-size: ${theme.typography.fontSize.m}px;
                                            padding: ${theme.spacing.m}px;
                                            line-height: 1.5;
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
                                    value={ensureStringValue(value)}
                                    onChangeText={(text) => {
                                        if (maxLength && text.length > maxLength) {
                                            return;
                                        }
                                        // Plain text mode is simpler - just pass the text value
                                        onChange(text.trim() === '' ? '' : text);
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

                        {/* Manual sync button for emergencies */}
                        {useRichEditor && (
                            <TouchableOpacity
                                style={styles.syncButton}
                                onPress={() => syncContent(onChange)}
                            >
                                <Text style={styles.syncButtonText}>Sync Content</Text>
                            </TouchableOpacity>
                        )}

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
                );
            }}
        />
    );
}