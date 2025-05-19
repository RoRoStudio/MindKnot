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
import { createPath, updatePath, getPathById } from '../services/pathService';
import { RootStackParamList } from '../types/navigation-types';
import { usePaths } from '../hooks/usePaths';

type PathScreenMode = 'create' | 'edit' | 'view';

type PathScreenRouteProp = RouteProp<
    {
        PathScreen: {
            mode: PathScreenMode;
            id?: string;
        };
    },
    'PathScreen'
>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PathFormValues {
    title: string;
    description: string;
    target: string;
    expectedDuration: string;
    tags: string[];
    categoryId: string | null;
}

export default function PathScreen() {
    const route = useRoute<PathScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { loadPaths } = usePaths();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<PathScreenMode>('create');
    const [pathId, setPathId] = useState<string | undefined>(undefined);

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
        pathContainer: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.l,
            padding: theme.spacing.m,
            marginVertical: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
        },
        milestonesContainer: {
            marginTop: theme.spacing.l,
        },
        milestonesTitle: {
            marginBottom: theme.spacing.m,
        },
        milestoneItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            marginBottom: theme.spacing.s,
        },
        milestoneNumber: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.m,
        },
        milestoneNumberText: {
            color: theme.colors.onPrimary,
            fontWeight: 'bold',
        },
        milestoneContent: {
            flex: 1,
        },
        addMilestoneButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.s,
            marginTop: theme.spacing.s,
        },
        addMilestoneText: {
            color: theme.colors.primary,
            marginLeft: theme.spacing.xs,
        },
        detailsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: theme.spacing.xs,
        },
        detailsLabel: {
            width: 100,
            marginRight: theme.spacing.m,
        },
        detailsValue: {
            flex: 1,
        },
    }));

    // Set up form with default values
    const { control, handleSubmit, reset, getValues, formState: { errors } } = useForm<PathFormValues>({
        defaultValues: {
            title: '',
            description: '',
            target: '',
            expectedDuration: '',
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
            setPathId(id);

            if ((routeMode === 'edit' || routeMode === 'view') && id) {
                loadPathData(id);
            }
        }
    }, [route.params]);

    // Load path data for edit or view mode
    const loadPathData = async (id: string) => {
        try {
            setIsLoading(true);
            const path = await getPathById(id);

            if (path) {
                reset({
                    title: path.title,
                    description: path.description || '',
                    target: path.target || '',
                    expectedDuration: path.expectedDuration || '',
                    tags: path.tags || [],
                    categoryId: path.categoryId || null,
                });
            } else {
                Alert.alert('Error', 'Path not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading path:', error);
            Alert.alert('Error', 'Failed to load path');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const onSubmit = async (data: PathFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const pathData = {
                title: data.title,
                description: data.description,
                target: data.target,
                expectedDuration: data.expectedDuration,
                tags: data.tags,
                categoryId: data.categoryId || undefined,
                type: 'path' as const,
            };

            let success;
            if (mode === 'edit' && pathId) {
                success = await updatePath(pathId, pathData);
            } else {
                await createPath(pathData);
                success = true;
            }

            if (success) {
                await loadPaths();
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to save the path. Please try again.');
            }
        } catch (error) {
            console.error('Error handling path:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Switch to edit mode from view mode
    const handleEditPress = () => {
        setMode('edit');
    };

    // Navigate to add action as a milestone
    const handleAddMilestone = () => {
        if (!pathId) return;

        // Navigate to ActionScreen with pathId as parent
        navigation.navigate('ActionScreen', {
            mode: 'create',
            parentId: pathId,
            parentType: 'path'
        });
    };

    // Render header based on mode
    const renderHeader = () => {
        let title = "";
        if (mode === 'create') title = "Create Path";
        else if (mode === 'edit') title = "Edit Path";
        else title = "Path Details";

        return (
            <EntryDetailHeader
                showEditButton={mode === 'view'}
                onEditPress={handleEditPress}
                onBackPress={() => navigation.goBack()}
                isSaved={!!pathId && mode === 'view'}
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

                <View style={{ flex: 1, paddingHorizontal: theme.spacing.m }}>
                    <FormRichTextarea
                        name="description"
                        control={control as unknown as Control<FieldValues>}
                        label="Path"
                        placeholder="Describe the path..."
                        adaptiveHeight={false}
                    />
                </View>

                <FormInput
                    name="target"
                    control={control as unknown as Control<FieldValues>}
                    label="Target Goal"
                    placeholder="What are you trying to achieve?"
                />

                <FormInput
                    name="expectedDuration"
                    control={control as unknown as Control<FieldValues>}
                    label="Expected Duration"
                    placeholder="e.g. 3 months, 6 weeks..."
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

                {values.description ? (
                    <View style={styles.pathContainer}>
                        <Typography variant="body1">{values.description}</Typography>
                    </View>
                ) : null}

                <View style={styles.metadataSection}>
                    <Typography variant="subtitle1">Details</Typography>

                    {values.target ? (
                        <View style={styles.detailsRow}>
                            <Typography variant="body2" style={styles.detailsLabel}>Target:</Typography>
                            <Typography variant="body2" style={styles.detailsValue}>
                                {values.target}
                            </Typography>
                        </View>
                    ) : null}

                    {values.expectedDuration ? (
                        <View style={styles.detailsRow}>
                            <Typography variant="body2" style={styles.detailsLabel}>Duration:</Typography>
                            <Typography variant="body2" style={styles.detailsValue}>
                                {values.expectedDuration}
                            </Typography>
                        </View>
                    ) : null}

                    {values.tags && values.tags.length > 0 && (
                        <>
                            <Typography variant="subtitle1" style={[styles.metadataTitle, { marginTop: theme.spacing.m }]}>
                                Tags:
                            </Typography>
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

                {pathId && (
                    <View style={styles.milestonesContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" style={styles.milestonesTitle}>
                                Milestones
                            </Typography>

                            <TouchableOpacity
                                style={styles.addMilestoneButton}
                                onPress={handleAddMilestone}
                            >
                                <Icon name="plus" width={16} height={16} color={theme.colors.primary} />
                                <Typography style={styles.addMilestoneText}>Add Milestone</Typography>
                            </TouchableOpacity>
                        </View>

                        {/* Milestone list would go here - we'll load them separately using related actions */}
                    </View>
                )}

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
                <View style={{ flex: 1 }}>
                    {mode === 'view' ? renderViewMode() : renderForm()}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 