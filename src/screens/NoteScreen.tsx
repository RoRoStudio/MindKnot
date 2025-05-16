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
import { Typography } from '../components/common/Typography';
import { Icon } from '../components/common/Icon';
import { Form, FormInput, FormRichTextarea, FormTagInput, FormCategorySelector } from '../components/form';
import { createNote, updateNote, getNoteById } from '../services/noteService';
import { RootStackParamList } from '../types/navigation-types';
import { useNotes } from '../hooks/useNotes';

type NoteScreenMode = 'create' | 'edit' | 'view';

type NoteScreenRouteProp = RouteProp<
    {
        NoteScreen: {
            mode: NoteScreenMode;
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
}

export default function NoteScreen() {
    const route = useRoute<NoteScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { loadNotes } = useNotes();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<NoteScreenMode>('create');
    const [noteId, setNoteId] = useState<string | undefined>(undefined);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
            padding: theme.spacing.m,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
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
        actionButton: {
            marginHorizontal: theme.spacing.s,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing.l,
            paddingHorizontal: theme.spacing.m,
            paddingBottom: theme.spacing.m,
        },
        submitButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.spacing.m,
            paddingHorizontal: theme.spacing.l,
            borderRadius: theme.shape.radius.m,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 120,
        },
        submitButtonText: {
            color: theme.colors.onPrimary,
            fontWeight: 'bold',
        },
        cancelButton: {
            paddingVertical: theme.spacing.m,
            paddingHorizontal: theme.spacing.l,
            borderRadius: theme.shape.radius.m,
            alignItems: 'center',
            justifyContent: 'center',
        },
        cancelButtonText: {
            color: theme.colors.textSecondary,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        metadataSection: {
            marginTop: theme.spacing.m,
        },
        metadataTitle: {
            marginBottom: theme.spacing.s,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: theme.spacing.m,
        },
        tag: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
        },
        dateText: {
            marginTop: theme.spacing.s,
            color: theme.colors.textSecondary,
        },
        editButton: {
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
    }));

    // Set up form with default values
    const { control, handleSubmit, reset, formState: { errors } } = useForm<NoteFormValues>({
        defaultValues: {
            title: '',
            body: '',
            tags: [],
            categoryId: null,
        },
        mode: 'onChange'
    });

    // Initialize from route params
    useEffect(() => {
        if (route.params) {
            const { mode: routeMode, id } = route.params;
            setMode(routeMode);
            setNoteId(id);

            if ((routeMode === 'edit' || routeMode === 'view') && id) {
                loadNoteData(id);
            }
        }
    }, [route.params]);

    // Load note data for edit or view mode
    const loadNoteData = async (id: string) => {
        try {
            setIsLoading(true);
            const note = await getNoteById(id);

            if (note) {
                reset({
                    title: note.title,
                    body: note.body || '',
                    tags: note.tags || [],
                    categoryId: note.categoryId || null,
                });
            } else {
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

    // Handle form submission
    const onSubmit = async (data: NoteFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const noteData = {
                title: data.title,
                body: data.body,
                tags: data.tags,
                categoryId: data.categoryId || undefined
            };

            let success;
            if (mode === 'edit' && noteId) {
                success = await updateNote(noteId, noteData);
            } else {
                await createNote(noteData);
                success = true;
            }

            if (success) {
                await loadNotes();
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to save the note. Please try again.');
            }
        } catch (error) {
            console.error('Error handling note:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Switch to edit mode from view mode
    const handleEditPress = () => {
        setMode('edit');
    };

    // Render header based on mode
    const renderHeader = () => {
        let title = "Create Note";
        if (mode === 'edit') title = "Edit Note";
        if (mode === 'view') title = "Note";

        return (
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" width={24} height={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>

                <Typography variant="h6" style={styles.headerTitle}>
                    {title}
                </Typography>

                {mode === 'view' && (
                    <TouchableOpacity onPress={handleEditPress} style={styles.actionButton}>
                        <Icon name="pencil" width={24} height={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // Render form for create and edit modes
    const renderForm = () => {
        return (
            <Form>
                <FormInput
                    name="title"
                    control={control as unknown as Control<FieldValues>}
                    label="Title"
                    placeholder="Enter a title..."
                    rules={{ required: 'Title is required' }}
                />

                <FormRichTextarea
                    name="body"
                    control={control as unknown as Control<FieldValues>}
                    label="Note"
                    placeholder="Write your note..."
                    rules={{ required: 'Note content is required' }}
                    numberOfLines={10}
                    editorMode="full"
                    resizable={true}
                    minHeight={200}
                    maxHeight={500}
                />

                <FormCategorySelector
                    name="categoryId"
                    control={control as unknown as Control<FieldValues>}
                    label="Category"
                />

                <FormTagInput
                    name="tags"
                    control={control as unknown as Control<FieldValues>}
                    label="Tags"
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={isSubmitting}
                    >
                        <Typography style={styles.cancelButtonText}>Cancel</Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        <Typography style={styles.submitButtonText}>
                            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
                        </Typography>
                    </TouchableOpacity>
                </View>
            </Form>
        );
    };

    // Render read-only view
    const renderViewMode = () => {
        const { getValues } = useForm();
        const values = getValues ? getValues() : { title: '', body: '', tags: [], categoryId: null };

        return (
            <View style={styles.content}>
                <Typography variant="h4">{values.title}</Typography>

                <View style={styles.metadataSection}>
                    {values.tags && values.tags.length > 0 && (
                        <>
                            <Typography variant="subtitle1" style={styles.metadataTitle}>Tags:</Typography>
                            <View style={styles.tagsContainer}>
                                {values.tags.map((tag: string, index: number) => (
                                    <View key={index} style={styles.tag}>
                                        <Typography variant="caption">{tag}</Typography>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </View>

                <Typography variant="body1">{values.body}</Typography>

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditPress}
                >
                    <Icon name="pencil" width={24} height={24} color={theme.colors.onPrimary} />
                </TouchableOpacity>
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {(mode === 'create' || mode === 'edit') ? (
                        <View style={styles.content}>
                            {renderForm()}
                        </View>
                    ) : (
                        renderViewMode()
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 