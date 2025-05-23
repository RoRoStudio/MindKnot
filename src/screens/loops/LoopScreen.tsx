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
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Icon } from '../../components/common';
import { EntryDetailHeader } from '../../components/entries';
import { Form, FormInput, FormRichTextarea, FormTagInput, FormCategorySelector } from '../../components/form';
import { createLoop, updateLoop, getLoopById } from '../../api/loopService';
import { RootStackParamList } from '../../types/navigation-types';
import { useLoops } from '../../hooks/useLoops';

type LoopScreenMode = 'create' | 'edit' | 'view';

type LoopScreenRouteProp = RouteProp<
    {
        LoopScreen: {
            mode: LoopScreenMode;
            id?: string;
        };
    },
    'LoopScreen'
>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoopFormValues {
    title: string;
    description: string;
    frequency: string;
    active: boolean;
    startDate?: string;
    endDate?: string;
    tags: string[];
    categoryId: string | null;
}

export default function LoopScreen() {
    const route = useRoute<LoopScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { loadLoops } = useLoops();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<LoopScreenMode>('create');
    const [loopId, setLoopId] = useState<string | undefined>(undefined);

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
        loopContainer: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.l,
            padding: theme.spacing.m,
            marginVertical: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
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
        loopItemsContainer: {
            marginTop: theme.spacing.l,
        },
        loopItemsTitle: {
            marginBottom: theme.spacing.m,
        },
        addItemButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.s,
            marginTop: theme.spacing.s,
        },
        addItemText: {
            color: theme.colors.primary,
            marginLeft: theme.spacing.xs,
        },
        activeIndicator: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.colors.success,
            marginRight: theme.spacing.s,
        },
        inactiveIndicator: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.colors.error,
            marginRight: theme.spacing.s,
        },
        loopItemsCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginVertical: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
        },
    }));

    // Set up form with default values
    const { control, handleSubmit, reset, setValue, watch, getValues, formState: { errors } } = useForm<LoopFormValues>({
        defaultValues: {
            title: '',
            description: '',
            frequency: '',
            active: true,
            startDate: undefined,
            endDate: undefined,
            tags: [],
            categoryId: null,
        },
        mode: 'onChange'
    });

    const active = watch('active');

    // Initialize from route params
    useEffect(() => {
        if (route.params) {
            const { mode: routeMode, id } = route.params;
            setMode(routeMode);
            setLoopId(id);

            if ((routeMode === 'edit' || routeMode === 'view') && id) {
                loadLoopData(id);
            }
        }
    }, [route.params]);

    // Load loop data for edit or view mode
    const loadLoopData = async (id: string) => {
        try {
            setIsLoading(true);
            const loop = await getLoopById(id);

            if (loop) {
                reset({
                    title: loop.title,
                    description: loop.description || '',
                    frequency: loop.frequency || '',
                    active: loop.active !== undefined ? loop.active : true,
                    startDate: loop.startDate,
                    endDate: loop.endDate,
                    tags: loop.tags || [],
                    categoryId: loop.categoryId || null,
                });
            } else {
                Alert.alert('Error', 'Loop not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading loop:', error);
            Alert.alert('Error', 'Failed to load loop');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const onSubmit = async (data: LoopFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            // Ensure startDate is always a string
            const currentDate = new Date().toISOString();

            const loopData = {
                title: data.title,
                description: data.description,
                frequency: data.frequency,
                active: data.active,
                startDate: data.startDate || currentDate, // Use current date if startDate is not provided
                endDate: data.endDate,
                tags: data.tags,
                categoryId: data.categoryId || undefined,
                type: 'loop' as const,
            };

            let success;
            if (mode === 'edit' && loopId) {
                success = await updateLoop(loopId, loopData);
            } else {
                await createLoop(loopData);
                success = true;
            }

            if (success) {
                await loadLoops();
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to save the loop. Please try again.');
            }
        } catch (error) {
            console.error('Error handling loop:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Switch to edit mode from view mode
    const handleEditPress = () => {
        setMode('edit');
    };

    // Navigate to add action as a loop item
    const handleAddLoopItem = () => {
        if (!loopId) return;

        // Navigate to ActionScreen with loopId as parent
        navigation.navigate('ActionScreen', {
            mode: 'create',
            parentId: loopId,
            parentType: 'loop-item'
        });
    };

    // Render header based on mode
    const renderHeader = () => {
        let title = "";
        if (mode === 'create') title = "Create Loop";
        else if (mode === 'edit') title = "Edit Loop";
        else title = "Loop Details";

        return (
            <EntryDetailHeader
                showEditButton={mode === 'view'}
                onEditPress={handleEditPress}
                onBackPress={() => navigation.goBack()}
                isSaved={!!loopId && mode === 'view'}
                title={title}
                entryType="Loop"
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
                        label="Loop"
                        placeholder="Describe the loop..."
                        adaptiveHeight={false}
                    />
                </View>

                <FormInput
                    name="frequency"
                    control={control as unknown as Control<FieldValues>}
                    label="Frequency"
                    placeholder="e.g. Daily, Weekly, Every 3 days..."
                />

                <FormInput
                    name="startDate"
                    control={control as unknown as Control<FieldValues>}
                    label="Start Date"
                    placeholder="YYYY-MM-DD"
                />

                <FormInput
                    name="endDate"
                    control={control as unknown as Control<FieldValues>}
                    label="End Date (optional)"
                    placeholder="YYYY-MM-DD"
                />

                <View style={styles.switchContainer}>
                    <Typography variant="body1" style={styles.switchLabel}>
                        Active
                    </Typography>
                    <Switch
                        value={active}
                        onValueChange={(value) => setValue('active', value)}
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Typography variant="h4">{values.title}</Typography>
                    <View style={values.active ? styles.activeIndicator : styles.inactiveIndicator} />
                    <Typography variant="caption">
                        {values.active ? 'Active' : 'Inactive'}
                    </Typography>
                </View>

                {values.description ? (
                    <View style={styles.loopContainer}>
                        <Typography variant="body1">{values.description}</Typography>
                    </View>
                ) : null}

                <View style={styles.metadataSection}>
                    <Typography variant="subtitle1">Details</Typography>

                    {values.frequency ? (
                        <View style={styles.detailsRow}>
                            <Typography variant="body2" style={styles.detailsLabel}>Frequency:</Typography>
                            <Typography variant="body2" style={styles.detailsValue}>
                                {values.frequency}
                            </Typography>
                        </View>
                    ) : null}

                    {values.startDate ? (
                        <View style={styles.detailsRow}>
                            <Typography variant="body2" style={styles.detailsLabel}>Start Date:</Typography>
                            <Typography variant="body2" style={styles.detailsValue}>
                                {values.startDate}
                            </Typography>
                        </View>
                    ) : null}

                    {values.endDate ? (
                        <View style={styles.detailsRow}>
                            <Typography variant="body2" style={styles.detailsLabel}>End Date:</Typography>
                            <Typography variant="body2" style={styles.detailsValue}>
                                {values.endDate}
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

                {loopId && (
                    <View style={styles.loopItemsContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" style={styles.loopItemsTitle}>
                                Loop Items
                            </Typography>

                            <TouchableOpacity
                                style={styles.addItemButton}
                                onPress={handleAddLoopItem}
                            >
                                <Icon name="plus" width={16} height={16} color={theme.colors.primary} />
                                <Typography style={styles.addItemText}>Add Item</Typography>
                            </TouchableOpacity>
                        </View>

                        {/* Loop items list would go here - we'll load them separately using related actions */}
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
                    entryType="Loop"
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