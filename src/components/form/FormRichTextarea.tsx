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
    ViewStyle,
    TextStyle,
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
    fullScreen?: boolean;
}

// Extend RichEditor props interface to include onInitialized
interface ExtendedRichEditorProps {
    onInitialized?: () => void;
    ref?: any;
    initialContentHTML?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    pasteAsPlainText?: boolean;
    useContainer?: boolean;
    containerStyle?: any;
    editorStyle?: any;
    onFocus?: () => void;
    onBlur?: () => void;
    onPaste?: (data: any) => void;
    style?: any;
}

// Define custom styles interface
interface RichTextEditorStyles {
    container: ViewStyle;
    label: TextStyle;
    formatToolbar: ViewStyle;
    fullScreenToolbar: ViewStyle;
    toolbarScroll: ViewStyle;
    formatButton: ViewStyle;
    formatButtonActive: ViewStyle;
    activeFormatButton: ViewStyle;
    editorContainer: ViewStyle;
    editor: ViewStyle;
    editorFullScreen: ViewStyle;
    toggleContainer: ViewStyle;
    toggleButton: ViewStyle;
    toggleButtonText: TextStyle;
    toggleText: TextStyle;
    resizeHandle: ViewStyle;
    resizeHandleLine: ViewStyle;
    plainTextInput: TextStyle;
    charCounter: TextStyle;
    helperText: TextStyle;
    errorContainer: ViewStyle;
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
    fullScreen = false,
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
                        // Reset and initialize the editor for better handling
                        document.body.style.userSelect = 'text';
                        document.body.style.webkitUserSelect = 'text';
                        document.body.style.MozUserSelect = 'text';
                        document.body.contentEditable = 'true';
                        
                        // Fix for proper styling and spacing
                        const styleTag = document.createElement('style');
                        styleTag.innerHTML = \`
                            body {
                                font-family: system-ui, -apple-system, sans-serif;
                                font-size: 16px;
                                line-height: 1.4;
                                color: #333;
                                padding: 10px;
                                padding-top: 15px !important;
                                margin: 0;
                                min-height: 100%;
                            }
                            
                            p {
                                margin: 0 0 10px 0;
                                padding: 0;
                            }
                            
                            br {
                                content: '';
                                margin: 0;
                                display: block;
                                line-height: 1.4;
                            }
                            
                            div, span {
                                margin: 0;
                                padding: 0;
                            }
                            
                            /* Ensure no extra spacing with lists */
                            ul, ol {
                                margin-top: 0;
                                margin-bottom: 10px;
                                padding-left: 20px;
                            }
                            
                            li {
                                margin-bottom: 5px;
                            }
                            
                            /* Fix heading margins */
                            h1, h2, h3, h4, h5, h6 {
                                margin-top: 20px;
                                margin-bottom: 10px;
                                line-height: 1.2;
                            }
                        \`;
                        document.head.appendChild(styleTag);
                        
                        // Fix Enter key behavior for single line breaks
                        document.addEventListener('keydown', function(e) {
                            if (e.key === 'Enter' || e.keyCode === 13) {
                                // Only add a single new line
                                if (!e.shiftKey) {
                                    e.preventDefault();
                                    document.execCommand('insertParagraph', false);
                                }
                            }
                        });
                    `);
                }
            }, 500);
        }
    }, [useRichEditor, editorRef.current]);

    const styles = useStyles<RichTextEditorStyles>((theme) => ({
        container: {
            marginBottom: fullScreen ? 0 : theme.spacing.m,
            flex: fullScreen ? 1 : undefined,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        formatToolbar: {
            flexDirection: 'row',
            backgroundColor: fullScreen ? theme.colors.background : theme.colors.surface,
            borderTopLeftRadius: fullScreen ? 0 : theme.components.inputs.radius,
            borderTopRightRadius: fullScreen ? 0 : theme.components.inputs.radius,
            borderWidth: fullScreen ? 0 : 1,
            borderBottomWidth: 0,
            borderColor: theme.components.inputs.border,
            padding: fullScreen ? theme.spacing.xs : theme.spacing.xs,
            overflow: 'hidden',
            marginBottom: 0,
            // Add shadow for better visual separation in fullScreen mode
            ...(fullScreen && {
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
            }),
        },
        fullScreenToolbar: {
            // Styles for fullscreen toolbar
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 4,
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
        activeFormatButton: {
            backgroundColor: theme.colors.primaryLight,
        },
        editorContainer: {
            borderWidth: fullScreen ? 0 : 1,
            borderTopWidth: fullScreen ? 0 : (isFocused ? 1 : 1),
            borderColor: theme.components.inputs.border,
            borderRadius: fullScreen ? 0 : theme.components.inputs.radius,
            borderTopLeftRadius: fullScreen ? 0 : (isFocused ? theme.components.inputs.radius : 0),
            borderTopRightRadius: fullScreen ? 0 : (isFocused ? theme.components.inputs.radius : 0),
            overflow: 'hidden',
            height: autoGrow ? 'auto' : actualNumberOfLines * 20,
            minHeight: fullScreen ? actualMinHeight : actualMinHeight,
            maxHeight: fullScreen ? undefined : actualMaxHeight,
            ...(fullScreen && {
                flex: 1,
            }),
        },
        editor: {
            flex: 1,
            height: '100%',
        },
        editorFullScreen: {
            borderWidth: 0,
            borderRadius: 0,
            overflow: 'visible',
        },
        toggleContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginBottom: theme.spacing.xs,
        },
        toggleButton: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        toggleButtonText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.primary,
            marginLeft: theme.spacing.xs,
        },
        toggleText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.primary,
            marginLeft: theme.spacing.xs,
        },
        resizeHandle: {
            height: 10,
            backgroundColor: theme.colors.surfaceVariant,
            borderBottomLeftRadius: theme.components.inputs.radius,
            borderBottomRightRadius: theme.components.inputs.radius,
            alignItems: 'center',
            justifyContent: 'center',
        },
        resizeHandleLine: {
            width: 30,
            height: 3,
            backgroundColor: theme.colors.border,
            borderRadius: 1.5,
        },
        plainTextInput: {
            padding: theme.spacing.m,
            flex: 1,
            textAlignVertical: 'top',
            fontSize: theme.typography.fontSize.m,
            color: theme.components.inputs.text,
            height: '100%',
        },
        charCounter: {
            position: 'absolute',
            bottom: 5,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            paddingHorizontal: 5,
            borderRadius: 10,
            fontSize: 10,
        },
        helperText: {
            marginTop: 4,
        },
        errorContainer: {
            marginTop: 4,
        },
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
            <View style={[styles.formatToolbar, fullScreen && styles.fullScreenToolbar]}>
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
        if (editorMode !== 'optional' || fullScreen) return null;

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
                            onChange(text);
                        } else {
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
        if (editorRef.current) {
            // Basic setup with strong styling rules
            editorRef.current.commandDOM(`
                document.body.style.fontFamily = 'System';
                document.body.style.fontSize = '${theme.typography.fontSize.m}px';
                document.body.style.padding = '${fullScreen ? theme.spacing.s : theme.spacing.m}px';
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
                const handleEditorChange = (html: string) => {
                    handleContentChange(html, onChange);
                };

                const initialHTML = ensureStringValue(value);

                return (
                    <View style={styles.container}>
                        {label && (
                            <Typography variant="body1" style={styles.label}>
                                {label}
                            </Typography>
                        )}

                        {editorMode === 'optional' && renderToggleButton()}

                        {useRichEditor ? (
                            <>
                                {/* Format toolbar only for rich editor mode */}
                                {renderFormatToolbar()}

                                <View style={[
                                    styles.editorContainer,
                                    fullScreen && styles.editorFullScreen
                                ]}>
                                    <RichEditor
                                        ref={(r) => {
                                            // Store editor ref
                                            editorRef.current = r;
                                            // Pass to react-hook-form
                                            if (typeof ref === 'function') ref(r);
                                        }}
                                        initialContentHTML={initialHTML}
                                        onChange={handleEditorChange}
                                        placeholder={placeholder}
                                        pasteAsPlainText={true}
                                        useContainer={true}
                                        containerStyle={{
                                            minHeight: actualMinHeight,
                                        }}
                                        editorStyle={{
                                            contentCSSText: `
                                                font-family: system-ui, -apple-system, sans-serif;
                                                font-size: 16px;
                                                line-height: 1.4;
                                                min-height: ${actualMinHeight}px;
                                            `,
                                        }}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => {
                                            setIsFocused(false);
                                            syncContent(onChange);
                                        }}
                                        // @ts-ignore - known prop in our version of the library
                                        onInitialized={handleEditorInitialized}
                                        onPaste={(data) => {
                                            // Handle paste events here
                                        }}
                                        style={styles.editor}
                                    />

                                    {/* Character counter overlay if needed */}
                                    {showCharCount && maxLength && (
                                        <Text style={[
                                            styles.charCounter,
                                            charCount >= maxLength && { color: theme.colors.error }
                                        ]}>
                                            {charCount}/{maxLength}
                                        </Text>
                                    )}
                                </View>

                                {/* Resizable handle for non-fullscreen mode */}
                                {resizable && !fullScreen && !autoGrow && (
                                    <TouchableOpacity
                                        style={styles.resizeHandle}
                                        onPressIn={() => setIsResizing(true)}
                                        onPressOut={() => setIsResizing(false)}
                                    >
                                        <View style={styles.resizeHandleLine} />
                                    </TouchableOpacity>
                                )}
                            </>
                        ) : (
                            <View style={styles.editorContainer}>
                                <TextInput
                                    value={plainText}
                                    onChangeText={(text) => {
                                        setPlainText(text);
                                        onChange(text);
                                        if (maxLength) {
                                            setCharCount(text.length);
                                        }
                                    }}
                                    placeholder={placeholder}
                                    multiline
                                    numberOfLines={actualNumberOfLines}
                                    style={styles.plainTextInput}
                                    maxLength={maxLength}
                                />
                            </View>
                        )}

                        {/* Error message and helper text */}
                        <FormErrorMessage message={error?.message} visible={!!error} />

                        {!error && helperText && (
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