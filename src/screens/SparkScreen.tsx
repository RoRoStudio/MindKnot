import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Control, FieldValues } from 'react-hook-form';
import { useTheme } from '../contexts/ThemeContext';
import { useStyles } from '../hooks/useStyles';
import { Typography, Icon } from '../components/common';
import { EntryDetailHeader } from '../components/organisms';
import { Form, FormInput, FormRichTextarea, FormTagInput, FormCategorySelector } from '../components/form';
import { createSpark, updateSpark, getSparkById } from '../services/sparkService';
import { RootStackParamList } from '../types/navigation-types';
import { useSparks } from '../hooks/useSparks';

type SparkScreenMode = 'create' | 'edit' | 'view';

type SparkScreenRouteProp = RouteProp<
    {
        SparkScreen: {
            mode: SparkScreenMode;
            id?: string;
        };
    },
    'SparkScreen'
>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SparkFormValues {
    title: string;
    body: string;
    tags: string[];
    categoryId: string | null;
}

export default function SparkScreen() {
    const route = useRoute<SparkScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { loadSparks } = useSparks();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<SparkScreenMode>('create');
    const [sparkId, setSparkId] = useState<string | undefined>(undefined);

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
        sparkContainer: {
            backgroundColor: theme.colors.secondaryContainer || theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.l,
            padding: theme.spacing.m,
            marginVertical: theme.spacing.m,
        },
    }));

    // Set up form with default values
    const { control, handleSubmit, reset, getValues, formState: { errors } } = useForm<SparkFormValues>({
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
            setSparkId(id);

            if ((routeMode === 'edit' || routeMode === 'view') && id) {
                loadSparkData(id);
            }
        }
    }, [route.params]);

    // Load spark data for edit or view mode
    const loadSparkData = async (id: string) => {
        try {
            setIsLoading(true);
            const spark = await getSparkById(id);

            if (spark) {
                reset({
                    title: spark.title,
                    body: spark.body || '',
                    tags: spark.tags || [],
                    categoryId: spark.categoryId || null,
                });
            } else {
                Alert.alert('Error', 'Spark not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading spark:', error);
            Alert.alert('Error', 'Failed to load spark');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const onSubmit = async (data: SparkFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const sparkData = {
                title: data.title,
                body: data.body,
                tags: data.tags,
                categoryId: data.categoryId || undefined
            };

            let success;
            if (mode === 'edit' && sparkId) {
                success = await updateSpark(sparkId, sparkData);
            } else {
                await createSpark(sparkData);
                success = true;
            }

            if (success) {
                await loadSparks();
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to save the spark. Please try again.');
            }
        } catch (error) {
            console.error('Error handling spark:', error);
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
        let title = "";
        if (mode === 'create') title = "Create Spark";
        else if (mode === 'edit') title = "Edit Spark";
        else title = "Spark Details";

        return (
            <EntryDetailHeader
                showEditButton={mode === 'view'}
                onEditPress={handleEditPress}
                onBackPress={() => navigation.goBack()}
                isSaved={!!sparkId && mode === 'view'}
                title={title}
            />
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
                    isTitle={true}
                />

                <FormRichTextarea
                    name="body"
                    control={control as unknown as Control<FieldValues>}
                    label="Spark"
                    placeholder="Capture your insight..."
                    rules={{ required: 'Spark content is required' }}
                    numberOfLines={5}
                    editorMode="light"
                    resizable={true}
                    minHeight={120}
                    maxHeight={300}
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
        const values = getValues();

        return (
            <View style={styles.content}>
                <Typography variant="h4">{values.title}</Typography>

                <View style={styles.sparkContainer}>
                    <Typography variant="body1">{values.body}</Typography>
                </View>

                <View style={styles.metadataSection}>
                    {values.tags && values.tags.length > 0 && (
                        <>
                            <Typography variant="subtitle1" style={styles.metadataTitle}>Tags:</Typography>
                            <View style={styles.tagsContainer}>
                                {values.tags.map((tag, index) => (
                                    <View key={index} style={styles.tag}>
                                        <Typography variant="caption">{tag}</Typography>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </View>

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
                <EntryDetailHeader
                    onBackPress={() => navigation.goBack()}
                    title="Loading..."
                />
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
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {mode === 'view' ? renderViewMode() : renderForm()}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 