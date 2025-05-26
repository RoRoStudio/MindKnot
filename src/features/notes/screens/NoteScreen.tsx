import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Control, FieldValues, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../shared/types/navigation-types';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Typography } from '../../../shared/components';
import {
    Form,
    FormInput,
    FormRichTextarea,
    FormTagInput,
    FormCategorySelector
} from '../../../shared/components';
import {
    EntryDetailHeader,
    EntryMetadataBar
} from '../../../shared/components';
import { useNotes } from '../hooks/useNotes';
import { createNote, getNoteById, updateNote } from '../hooks/useNoteService';

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
    const { loadNotes } = useNotes();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [noteId, setNoteId] = useState<string | undefined>(undefined);
    const [lastEdited, setLastEdited] = useState<Date | null>(null);

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
        },
        lastEditedText: {
            textAlign: 'right',
            marginRight: theme.spacing.m,
            marginBottom: theme.spacing.xs,
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.xs,
        },
        titleInput: {
            fontSize: theme.typography.fontSize.xxl,
            fontWeight: theme.typography.fontWeight.bold,
            paddingHorizontal: theme.spacing.m,
            paddingTop: theme.spacing.s,
            paddingBottom: theme.spacing.m,
            borderWidth: 0,
        },
        editorContainer: {
            flex: 1,
            paddingHorizontal: theme.spacing.m,
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

    // Handle label change
    const handleLabelsChange = (newLabels: string[]) => {
        setValue('tags', newLabels, { shouldDirty: true });
    };

    // Handle category change
    const handleCategoryChange = (newCategoryId: string | null) => {
        setValue('categoryId', newCategoryId, { shouldDirty: true });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <EntryDetailHeader
                    onBackPress={handleBackPress}
                    entryType="Note"
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={styles.container.backgroundColor} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <EntryDetailHeader
                isStarred={watchedValues.isStarred}
                onStarPress={toggleStar}
                onBackPress={handleBackPress}
                onArchivePress={handleArchive}
                onDuplicatePress={handleDuplicate}
                onHidePress={handleHide}
                isSaved={!!noteId}
                entryType="Note"
            />

            <EntryMetadataBar
                categoryId={watchedValues.categoryId}
                onCategoryChange={handleCategoryChange}
                labels={watchedValues.tags}
                onLabelsChange={handleLabelsChange}
                isEditing={true}
            />

            {lastEdited && (
                <Typography variant="caption" style={styles.lastEditedText}>
                    Last edited {formatLastEdited()}
                </Typography>
            )}

            <View style={{ flex: 1 }}>
                <Form style={{ flex: 1 }}>
                    <View collapsable={false} style={{ flex: 1 }}>
                        <FormInput
                            name="title"
                            control={control as unknown as Control<FieldValues>}
                            placeholder="Untitled Note"
                            style={styles.titleInput}
                            isTitle={true}
                        />

                        <View style={styles.editorContainer}>
                            <FormRichTextarea
                                name="body"
                                control={control as unknown as Control<FieldValues>}
                                placeholder="Write your note..."
                            />
                        </View>
                    </View>
                </Form>
            </View>
        </SafeAreaView>
    );
} 