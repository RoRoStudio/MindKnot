import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Control, FieldValues } from 'react-hook-form';
import { useTheme } from '../contexts/ThemeContext';
import { useStyles } from '../hooks/useStyles';
import { Typography } from '../components/common/Typography';
import { Icon } from '../components/common/Icon';
import { DetailScreenHeader } from '../components/common/DetailScreenHeader';
import { Form, FormInput, FormRichTextarea, FormTagInput, FormCategorySelector } from '../components/form';
import { createAction, updateAction, getActionById } from '../services/actionService';
import { RootStackParamList } from '../types/navigation-types';
import { useActions } from '../hooks/useActions';

type ActionScreenMode = 'create' | 'edit' | 'view';

type ActionScreenRouteProp = RouteProp<
    {
        ActionScreen: {
            mode: ActionScreenMode;
            id?: string;
            parentId?: string;
            parentType?: 'path' | 'milestone' | 'loop-item';
        };
    },
    'ActionScreen'
>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ActionFormValues {
    title: string;
    description: string;
    dueDate?: string;
    completed: boolean;
    priority: number;
    tags: string[];
    categoryId: string | null;
}

export default function ActionScreen() {
    const route = useRoute<ActionScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { loadActions } = useActions();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ActionScreenMode>('create');
    const [actionId, setActionId] = useState<string | undefined>(undefined);
    const [parentId, setParentId] = useState<string | undefined>(undefined);
    const [parentType, setParentType] = useState<'path' | 'milestone' | 'loop-item' | undefined>(undefined);

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
        switchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        switchLabel: {
            flex: 1,
        },
        priorityContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.m,
        },
        priorityButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.s,
        },
        priorityActive: {
            backgroundColor: theme.colors.primary,
        },
        priorityInactive: {
            backgroundColor: theme.colors.surfaceVariant,
        },
        priorityText: {
            color: theme.colors.onPrimary,
            fontWeight: 'bold',
        },
        priorityInactiveText: {
            color: theme.colors.textSecondary,
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
        completedText: {
            textDecorationLine: 'line-through',
            color: theme.colors.textSecondary,
        },
    }));

    // Set up form with default values
    const { control, handleSubmit, reset, setValue, watch, getValues, formState: { errors } } = useForm<ActionFormValues>({
        defaultValues: {
            title: '',
            description: '',
            dueDate: undefined,
            completed: false,
            priority: 2,
            tags: [],
            categoryId: null,
        },
        mode: 'onChange'
    });

    const completed = watch('completed');
    const priority = watch('priority');

    // Initialize from route params
    useEffect(() => {
        if (route.params) {
            const { mode: routeMode, id, parentId: routeParentId, parentType: routeParentType } = route.params;
            setMode(routeMode);
            setActionId(id);
            setParentId(routeParentId);
            setParentType(routeParentType);

            if ((routeMode === 'edit' || routeMode === 'view') && id) {
                loadActionData(id);
            }
        }
    }, [route.params]);

    // Load action data for edit or view mode
    const loadActionData = async (id: string) => {
        try {
            setIsLoading(true);
            const action = await getActionById(id);

            if (action) {
                reset({
                    title: action.title,
                    description: action.description || action.body || '',
                    dueDate: action.dueDate,
                    completed: action.completed !== undefined ? action.completed : action.done,
                    priority: action.priority !== undefined ? action.priority : 2,
                    tags: action.tags || [],
                    categoryId: action.categoryId || null,
                });
            } else {
                Alert.alert('Error', 'Action not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading action:', error);
            Alert.alert('Error', 'Failed to load action');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const onSubmit = async (data: ActionFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const actionData = {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                done: data.completed,
                completed: data.completed,
                priority: data.priority,
                tags: data.tags,
                categoryId: data.categoryId || undefined,
                parentId: parentId,
                parentType: parentType,
                type: 'action' as const,
            };

            let success;
            if (mode === 'edit' && actionId) {
                success = await updateAction(actionId, actionData);
            } else {
                await createAction(actionData);
                success = true;
            }

            if (success) {
                await loadActions();
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to save the action. Please try again.');
            }
        } catch (error) {
            console.error('Error handling action:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Switch to edit mode from view mode
    const handleEditPress = () => {
        setMode('edit');
    };

    // Handle priority selection
    const handlePrioritySelect = (value: number) => {
        setValue('priority', value);
    };

    // Render header based on mode
    const renderHeader = () => {
        let title = "Create Action";
        if (mode === 'edit') title = "Edit Action";
        if (mode === 'view') title = "Action";

        return (
            <DetailScreenHeader
                title={title}
                iconName="square-check"
                showEditButton={mode === 'view'}
                onEditPress={handleEditPress}
            />
        );
    };

    // Render priority selection
    const renderPrioritySelector = () => {
        return (
            <View>
                <Typography variant="body1" style={{ marginBottom: theme.spacing.s }}>Priority</Typography>
                <View style={styles.priorityContainer}>
                    {[1, 2, 3].map((value) => (
                        <TouchableOpacity
                            key={value}
                            style={[
                                styles.priorityButton,
                                priority === value ? styles.priorityActive : styles.priorityInactive
                            ]}
                            onPress={() => handlePrioritySelect(value)}
                            disabled={mode === 'view'}
                        >
                            <Typography
                                style={priority === value ? styles.priorityText : styles.priorityInactiveText}
                            >
                                {value}
                            </Typography>
                        </TouchableOpacity>
                    ))}
                    <Typography variant="caption" style={{ marginLeft: theme.spacing.s }}>
                        {priority === 1 ? 'Low' : priority === 2 ? 'Medium' : 'High'}
                    </Typography>
                </View>
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
                    name="description"
                    control={control as unknown as Control<FieldValues>}
                    label="Description"
                    placeholder="Describe the action..."
                    numberOfLines={4}
                    editorMode="light"
                    resizable={true}
                    minHeight={100}
                    maxHeight={250}
                />

                <FormInput
                    name="dueDate"
                    control={control as unknown as Control<FieldValues>}
                    label="Due Date"
                    placeholder="YYYY-MM-DD"
                />

                {renderPrioritySelector()}

                <View style={styles.switchContainer}>
                    <Typography variant="body1" style={styles.switchLabel}>
                        Completed
                    </Typography>
                    <Switch
                        value={completed}
                        onValueChange={(value) => setValue('completed', value)}
                        trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
                        thumbColor={theme.colors.surface}
                    />
                </View>

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
                <Typography
                    variant="h4"
                    style={values.completed ? styles.completedText : undefined}
                >
                    {values.title}
                </Typography>

                {values.description ? (
                    <Typography
                        variant="body1"
                        style={[{ marginTop: theme.spacing.m }, values.completed ? styles.completedText : undefined]}
                    >
                        {values.description}
                    </Typography>
                ) : null}

                <View style={styles.metadataSection}>
                    <Typography variant="subtitle1">Details</Typography>

                    <View style={styles.detailsRow}>
                        <Typography variant="body2" style={styles.detailsLabel}>Status:</Typography>
                        <Typography variant="body2" style={styles.detailsValue}>
                            {values.completed ? 'Completed' : 'Pending'}
                        </Typography>
                    </View>

                    {values.dueDate ? (
                        <View style={styles.detailsRow}>
                            <Typography variant="body2" style={styles.detailsLabel}>Due Date:</Typography>
                            <Typography variant="body2" style={styles.detailsValue}>
                                {values.dueDate}
                            </Typography>
                        </View>
                    ) : null}

                    <View style={styles.detailsRow}>
                        <Typography variant="body2" style={styles.detailsLabel}>Priority:</Typography>
                        <Typography variant="body2" style={styles.detailsValue}>
                            {values.priority === 1 ? 'Low' : values.priority === 2 ? 'Medium' : 'High'}
                        </Typography>
                    </View>

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