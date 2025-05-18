import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Control, FieldValues } from 'react-hook-form';
import { useTheme } from '../contexts/ThemeContext';
import { useStyles } from '../hooks/useStyles';
import { Typography, Icon } from '../components/common';
import { Tag } from '../components/atoms';
import { Form, FormInput, FormRichTextarea, FormTagInput, FormCategorySelector } from '../components/form';
import { createNote, updateNote, getNoteById } from '../services/noteService';
import { RootStackParamList } from '../types/navigation-types';
import { useNotes } from '../hooks/useNotes';

type NoteScreenRouteProp = RouteProp<
    {
        NoteScreen: {
            id?: string;
        };
    },
    'NoteScreen'
>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NoteFormValues {
    title: string;
    body: string;
    tags: string[];
    categoryId: string | null;
    isStarred?: boolean;
}

export default function NoteScreen() {
    const route = useRoute<NoteScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { loadNotes } = useNotes();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [noteId, setNoteId] = useState<string | undefined>(undefined);
    const [lastEdited, setLastEdited] = useState<Date | null>(null);
    const [showCategorySelector, setShowCategorySelector] = useState(false);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: '#FFFFFF',
        },
        content: {
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.m,
        },
        headerLeftSection: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerRightSection: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        backButton: {
            padding: theme.spacing.xs,
        },
        actionButton: {
            padding: theme.spacing.m,
        },
        lastEditedText: {
            textAlign: 'right',
            marginRight: theme.spacing.m,
            marginBottom: theme.spacing.xs,
            color: theme.colors.textSecondary,
            fontSize: 12,
        },
        titleInput: {
            fontSize: 26,
            fontWeight: 'bold',
            paddingHorizontal: theme.spacing.m,
            paddingTop: theme.spacing.s,
            paddingBottom: theme.spacing.m,
            borderWidth: 0,
        },
        metadataSection: {
            paddingHorizontal: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: theme.spacing.s,
            alignItems: 'center',
        },
        tagItem: {
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
        },
        addTagButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 4,
            paddingHorizontal: theme.spacing.s,
            borderRadius: theme.shape.radius.m,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.primary,
        },
        addTagText: {
            color: theme.colors.primary,
            marginLeft: 4,
            fontSize: theme.typography.fontSize.s,
        },
        categoryButton: {
            marginTop: theme.spacing.xs,
            alignSelf: 'flex-start',
            paddingVertical: 4,
            paddingHorizontal: 8,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 16,
        },
        actionButtonsRow: {
            flexDirection: 'row',
            marginBottom: theme.spacing.m,
            paddingHorizontal: theme.spacing.m,
        },
        inlineActionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: theme.spacing.l,
        },
        inlineActionButtonText: {
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.xs,
        },
        editorContainer: {
            flex: 1,
            paddingHorizontal: 0,
            marginTop: theme.spacing.s,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    }));

    // Set up form with default values
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isDirty }
    } = useForm<NoteFormValues>({
        defaultValues: {
            title: '',
            body: '',
            tags: [],
            categoryId: null,
            isStarred: false,
        },
        mode: 'onChange'
    });

    // Watch for values to update UI
    const watchedValues = watch();

    // Initialize from route params
    useEffect(() => {
        if (route.params?.id) {
            setNoteId(route.params.id);
            loadNoteData(route.params.id);
        }
    }, [route.params]);

    // Auto-save on changes after a delay
    useEffect(() => {
        if (isDirty && noteId) {
            const timer = setTimeout(() => {
                handleSubmit(onSubmit)();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [watchedValues, isDirty, noteId]);

    // Load note data if editing existing note
    const loadNoteData = async (id: string) => {
        try {
            setIsLoading(true);
            const note = await getNoteById(id);

            if (note) {
                reset({
                    title: note.title || '',
                    body: note.body || '',
                    tags: note.tags || [],
                    categoryId: note.categoryId || null,
                    isStarred: note.isStarred || false,
                });

                if (note.updatedAt) {
                    setLastEdited(new Date(note.updatedAt));
                }
            } else {
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading note:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const onSubmit = async (data: NoteFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const noteData = {
                title: data.title || 'Untitled Note',
                body: data.body,
                tags: data.tags,
                categoryId: data.categoryId || undefined,
                isStarred: data.isStarred
            };

            let success;
            if (noteId) {
                success = await updateNote(noteId, noteData);
                if (success) {
                    setLastEdited(new Date());
                }
            } else {
                const newNoteId = await createNote(noteData);
                if (newNoteId && typeof newNoteId === 'string') {
                    setNoteId(newNoteId);
                    setLastEdited(new Date());
                    success = true;
                }
            }

            if (!success) {
                console.error('Failed to save note');
            }
        } catch (error) {
            console.error('Error handling note:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackPress = () => {
        handleSubmit(onSubmit)();
        navigation.goBack();
    };

    const toggleStar = () => {
        setValue('isStarred', !watchedValues.isStarred);
        handleSubmit(onSubmit)();
    };

    const handleArchive = () => {
        // Implement archive functionality
        navigation.goBack();
    };

    const handleDuplicate = async () => {
        if (noteId) {
            try {
                const note = await getNoteById(noteId);
                if (note) {
                    const duplicateData = {
                        title: `${note.title} (Copy)`,
                        body: note.body,
                        tags: note.tags,
                        categoryId: note.categoryId
                    };
                    await createNote(duplicateData);
                    await loadNotes();
                }
            } catch (error) {
                console.error('Error duplicating note:', error);
            }
        }
        navigation.goBack();
    };

    const handleHide = () => {
        // Implement hide functionality
        navigation.goBack();
    };

    const formatLastEdited = () => {
        if (!lastEdited) return '';

        const now = new Date();
        const diffMs = now.getTime() - lastEdited.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

        return lastEdited.toLocaleDateString();
    };

    const toggleCategorySelector = () => {
        setShowCategorySelector(!showCategorySelector);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeftSection}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerRightSection}>
                    <TouchableOpacity onPress={toggleStar} style={styles.actionButton}>
                        <Icon
                            name={watchedValues.isStarred ? "star" : "star-off"}
                            width={20}
                            height={20}
                            color={watchedValues.isStarred ? "#FFB800" : theme.colors.textPrimary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleArchive} style={styles.actionButton}>
                        <Icon name="archive" width={20} height={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDuplicate} style={styles.actionButton}>
                        <Icon name="copy" width={20} height={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleHide} style={styles.actionButton}>
                        <Icon name="eye-off" width={20} height={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Last edited timestamp */}
            {lastEdited && (
                <Typography variant="caption" style={styles.lastEditedText}>
                    Last edited {formatLastEdited()}
                </Typography>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Form style={{ flex: 1 }}>
                        {/* Title Input */}
                        <FormInput
                            name="title"
                            control={control as unknown as Control<FieldValues>}
                            placeholder="Untitled Note"
                            style={styles.titleInput}
                        />

                        {/* Tags and Categories */}
                        <View style={styles.metadataSection}>
                            <View style={styles.tagsContainer}>
                                <FormTagInput
                                    name="tags"
                                    control={control as unknown as Control<FieldValues>}
                                    placeholder="Add tags..."
                                />
                            </View>

                            {watchedValues.categoryId ? (
                                <TouchableOpacity
                                    style={styles.categoryButton}
                                    onPress={toggleCategorySelector}
                                >
                                    <Typography variant="caption" color="primary">
                                        {watchedValues.categoryId ? "Change Category" : "Add Category"}
                                    </Typography>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.categoryButton}
                                    onPress={toggleCategorySelector}
                                >
                                    <Typography variant="caption" color="primary">
                                        Add Category
                                    </Typography>
                                </TouchableOpacity>
                            )}

                            {showCategorySelector && (
                                <FormCategorySelector
                                    name="categoryId"
                                    control={control as unknown as Control<FieldValues>}
                                />
                            )}
                        </View>

                        {/* Rich Text Editor */}
                        <View style={styles.editorContainer}>
                            <FormRichTextarea
                                name="body"
                                control={control as unknown as Control<FieldValues>}
                                placeholder="Write your note..."
                                editorMode="full"
                                minHeight={400}
                                fullScreen={true}
                            />
                        </View>
                    </Form>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 