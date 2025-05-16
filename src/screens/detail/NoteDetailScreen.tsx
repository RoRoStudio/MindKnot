import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
    Platform,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Note } from '../../types/note';
import { useNotes } from '../../hooks/useNotes';
import { useStyles } from '../../hooks/useStyles';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../../components/common/Icon';
import { Typography } from '../../components/common/Typography';
import { useCategories } from '../../hooks/useCategories';
import { getNoteById } from '../../services/noteService';
import { RootStackParamList } from '../../types/navigation-types';

// Route params type
type NoteDetailRouteProp = RouteProp<
    {
        NoteDetail: {
            noteId: string;
        };
    },
    'NoteDetail'
>;

type NoteDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function NoteDetailScreen() {
    const route = useRoute<NoteDetailRouteProp>();
    const navigation = useNavigation<NoteDetailScreenNavigationProp>();
    const { theme } = useTheme();
    const { notes, loadNotes, editNote, removeNote } = useNotes();
    const { categories } = useCategories();

    const [note, setNote] = useState<Note | null>(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isSaving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const titleInputRef = useRef<TextInput>(null);
    const bodyInputRef = useRef<TextInput>(null);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        backButton: {
            padding: theme.spacing.s,
        },
        headerTitle: {
            flex: 1,
            marginLeft: theme.spacing.s,
        },
        optionsButton: {
            padding: theme.spacing.s,
        },
        content: {
            flex: 1,
            padding: theme.spacing.m,
        },
        titleInput: {
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
            padding: 0,
            marginBottom: theme.spacing.m,
        },
        bodyInput: {
            flex: 1,
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            padding: 0,
            textAlignVertical: 'top',
        },
        metadataSection: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
            marginBottom: theme.spacing.m,
        },
        tag: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
        },
        tagText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        category: {
            borderRadius: theme.shape.radius.m,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            marginRight: theme.spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
        },
        categoryDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 4,
        },
        categoryText: {
            fontSize: theme.typography.fontSize.s,
        },
        createdText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.s,
        },
        saveButton: {
            position: 'absolute',
            right: theme.spacing.l,
            bottom: theme.spacing.l,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 4,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
        },
        saveButtonDisabled: {
            backgroundColor: theme.colors.surfaceVariant,
        },
        optionsMenu: {
            position: 'absolute',
            top: 60,
            right: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.s,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 4,
            zIndex: 1000,
        },
        optionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderRadius: theme.shape.radius.s,
        },
        optionText: {
            marginLeft: theme.spacing.s,
            fontSize: theme.typography.fontSize.m,
        },
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 999,
        },
    }));

    // Load the note from the ID passed in route params
    useEffect(() => {
        const fetchNote = async () => {
            try {
                setIsLoading(true);
                const { noteId } = route.params;

                // First try to find the note in the already loaded notes
                let foundNote = notes.find(n => n.id === noteId);

                // If not found, try to fetch directly from the database
                if (!foundNote) {
                    console.log(`Note not found in state, fetching with ID: ${noteId}`);
                    const dbNote = await getNoteById(noteId);

                    if (dbNote) {
                        foundNote = dbNote;
                    }

                    // Also reload all notes for consistency
                    loadNotes();
                }

                if (foundNote) {
                    console.log(`Note found: ${foundNote.title}`);
                    setNote(foundNote);
                    setTitle(foundNote.title);
                    setBody(foundNote.body || '');
                } else {
                    console.log(`Note with ID ${noteId} not found even in database`);
                    Alert.alert('Error', 'Note not found');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Error loading note:', error);
                Alert.alert('Error', 'Failed to load note');
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        fetchNote();
    }, [route.params, notes, navigation, loadNotes]);

    // Track changes
    useEffect(() => {
        if (!note) return;

        const titleChanged = title !== note.title;
        const bodyChanged = body !== (note.body || '');

        setHasChanges(titleChanged || bodyChanged);
    }, [title, body, note]);

    // Handle save button press
    const handleSave = useCallback(async () => {
        if (!note || !hasChanges) return;

        try {
            setSaving(true);

            const updates = {
                title,
                body: body.trim() !== '' ? body : undefined,
            };

            const success = await editNote(note.id, updates);

            if (success) {
                setHasChanges(false);
                // Hide keyboard after saving
                Keyboard.dismiss();
            } else {
                Alert.alert('Error', 'Failed to save changes');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    }, [note, title, body, hasChanges, editNote]);

    // Handle back button press
    const handleBack = useCallback(() => {
        if (hasChanges) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Save before leaving?',
                [
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => navigation.goBack(),
                    },
                    {
                        text: 'Save',
                        onPress: async () => {
                            await handleSave();
                            navigation.goBack();
                        },
                    },
                ]
            );
        } else {
            navigation.goBack();
        }
    }, [hasChanges, navigation, handleSave]);

    // Handle delete note
    const handleDeleteNote = useCallback(() => {
        if (!note) return;

        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = await removeNote(note.id);
                            if (success) {
                                navigation.goBack();
                            } else {
                                Alert.alert('Error', 'Failed to delete note');
                            }
                        } catch (error) {
                            console.error('Error deleting note:', error);
                            Alert.alert('Error', 'An unexpected error occurred');
                        }
                    },
                },
            ]
        );
    }, [note, removeNote, navigation]);

    // Toggle options menu
    const toggleOptions = useCallback(() => {
        setShowOptions(prev => !prev);
    }, []);

    // Format date for display
    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, []);

    // Get category for the note
    const getCategory = useCallback(() => {
        if (!note?.categoryId) return null;
        return categories.find(c => c.id === note.categoryId) || null;
    }, [note, categories]);

    const category = getCategory();

    if (!note) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <Typography variant="h4" style={styles.headerTitle}>
                        {isLoading ? "Loading..." : "Note not found"}
                    </Typography>
                </View>

                {isLoading && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Typography style={{ marginTop: 16 }}>Loading note...</Typography>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Typography variant="h4" style={styles.headerTitle}>{hasChanges ? 'Editing' : 'Note'}</Typography>
                <TouchableOpacity onPress={toggleOptions} style={styles.optionsButton}>
                    <Icon name="ellipsis-vertical" width={24} height={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Options Menu */}
            {showOptions && (
                <>
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={toggleOptions}
                    />
                    <View style={styles.optionsMenu}>
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                toggleOptions();
                                // Add tag functionality here
                                Alert.alert('Coming Soon', 'Tag management will be available soon!');
                            }}
                        >
                            <Icon name="tag" width={20} height={20} color={theme.colors.textPrimary} />
                            <Typography style={styles.optionText}>Manage Tags</Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                toggleOptions();
                                // Add category functionality here
                                Alert.alert('Coming Soon', 'Category selection will be available soon!');
                            }}
                        >
                            <Icon name="list" width={20} height={20} color={theme.colors.textPrimary} />
                            <Typography style={styles.optionText}>Change Category</Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => {
                                toggleOptions();
                                handleDeleteNote();
                            }}
                        >
                            <Icon name="trash" width={20} height={20} color={theme.colors.error} />
                            <Typography style={[styles.optionText, { color: theme.colors.error }]}>Delete Note</Typography>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Main Content */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title Input */}
                    <TextInput
                        ref={titleInputRef}
                        style={styles.titleInput}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Note Title"
                        placeholderTextColor={theme.colors.textSecondary}
                        selectionColor={theme.colors.primary}
                        multiline={false}
                        returnKeyType="next"
                        blurOnSubmit={true}
                        onSubmitEditing={() => bodyInputRef.current?.focus()}
                    />

                    {/* Tags & Category */}
                    <View style={styles.metadataSection}>
                        {category && (
                            <View style={[
                                styles.category,
                                {
                                    backgroundColor: `${category.color}20`,
                                    borderColor: category.color,
                                    borderWidth: 1
                                }
                            ]}>
                                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                                <Typography style={styles.categoryText}>{category.title}</Typography>
                            </View>
                        )}

                        {note.tags && note.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Typography style={styles.tagText}>#{tag}</Typography>
                            </View>
                        ))}
                    </View>

                    {/* Body Input */}
                    <TextInput
                        ref={bodyInputRef}
                        style={{
                            flex: 1,
                            fontSize: 16,
                            color: theme.colors.textPrimary,
                            padding: 0,
                            textAlignVertical: 'top',
                            height: 300
                        }}
                        value={body}
                        onChangeText={setBody}
                        placeholder="Start writing your note here..."
                        placeholderTextColor={theme.colors.textSecondary}
                        selectionColor={theme.colors.primary}
                        multiline={true}
                        autoCapitalize="sentences"
                        textAlignVertical="top"
                    />

                    {/* Created date */}
                    <Typography style={styles.createdText}>
                        Created: {formatDate(note.createdAt)}
                    </Typography>

                    {/* Add some padding at the bottom to ensure content isn't hidden behind the save button */}
                    <View style={{ height: 80 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Save Button */}
            {hasChanges && (
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        (isSaving || !hasChanges) && styles.saveButtonDisabled
                    ]}
                    onPress={handleSave}
                    disabled={isSaving || !hasChanges}
                >
                    <Icon
                        name="check"
                        width={24}
                        height={24}
                        color={theme.colors.onPrimary}
                    />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
} 