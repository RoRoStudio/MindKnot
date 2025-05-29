/**
 * LoopBuilderScreen - Simple 3-Step Loop Builder
 * Following PathScreen.tsx patterns exactly with EntryDetailHeader and EntryMetadataBar
 * 
 * Step 1: Basic Info (Simple Form)
 * Step 2: Template Selection + Activity Customization  
 * Step 3: Settings & Finalize (Enhanced)
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { useTheme } from '../../../app/contexts/ThemeContext';
import {
    Typography,
    Button,
    FormInput,
    FormTextarea,
    FormSwitch,
    BottomSheet,
    EntryDetailHeader,
    EntryMetadataBar,
    EntryTitleInput,
} from '../../../shared/components';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { ActivityTemplateSelector } from '../components/ActivityTemplateSelector';
import { ActivityInstanceEditor } from '../components/ActivityInstanceEditor';
import { LoopSettingsForm } from '../components/LoopSettingsForm';
import { LoopPreviewCard } from '../components/LoopPreviewCard';
import { useActivityTemplates } from '../hooks/useActivityTemplates';
import { useLoops } from '../hooks/useLoops';
import { RootStackParamList } from '../../../shared/types/navigation';
import { Loop, ActivityInstance, ActivityTemplate, NotificationSettings, ScheduleSettings } from '../../../shared/types/loop';
import { generateUUID } from '../../../shared/utils/uuid';

type LoopBuilderMode = 'create' | 'edit' | 'view';

type LoopBuilderRouteProp = RouteProp<
    {
        LoopBuilderScreen: {
            mode: LoopBuilderMode;
            id?: string;
        };
    },
    'LoopBuilderScreen'
>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoopFormValues {
    title: string;
    description: string;
    tags: string[];
    categoryId: string | undefined;
    backgroundExecution: boolean;
}

type BuilderStep = 1 | 2 | 3;

export default function LoopBuilderScreen() {
    const route = useRoute<LoopBuilderRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { createLoop, updateLoop, getLoopById, loadLoops } = useLoops();
    const { templates, categories, getTemplatesByCategory } = useActivityTemplates();

    // State management
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<LoopBuilderMode>('create');
    const [loopId, setLoopId] = useState<string | undefined>(undefined);
    const [currentStep, setCurrentStep] = useState<BuilderStep>(1);

    // Activity management
    const [activities, setActivities] = useState<ActivityInstance[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);
    const [editingActivity, setEditingActivity] = useState<ActivityInstance | null>(null);
    const [showActivityEditor, setShowActivityEditor] = useState(false);

    // Settings
    const [backgroundExecution, setBackgroundExecution] = useState(true);
    const [notifications, setNotifications] = useState<NotificationSettings>({
        enabled: true,
        activityReminders: true,
        sessionProgress: true,
        completionCelebration: true,
        soundEnabled: true,
        vibrationEnabled: true,
        persistentOverlay: true,
    });
    const [scheduling, setScheduling] = useState<ScheduleSettings | undefined>(undefined);

    // Bottom sheets
    const [showNotificationSettings, setShowNotificationSettings] = useState(false);
    const [showSchedulingSettings, setShowSchedulingSettings] = useState(false);

    // Form setup
    const { control, handleSubmit, reset, getValues, setValue, watch } = useForm<LoopFormValues>({
        defaultValues: {
            title: '',
            description: '',
            tags: [],
            categoryId: undefined,
            backgroundExecution: true,
        },
        mode: 'onChange'
    });

    const categoryId = watch('categoryId');
    const labels = watch('tags');

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
        },
        scrollContent: {
            padding: theme.spacing.m,
            paddingBottom: theme.spacing.xl,
        },
        stepIndicator: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.spacing.m,
            paddingHorizontal: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        stepDot: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: theme.spacing.xs,
        },
        stepDotActive: {
            backgroundColor: theme.colors.primary,
        },
        stepDotCompleted: {
            backgroundColor: theme.colors.success,
        },
        stepLine: {
            flex: 1,
            height: 2,
            backgroundColor: theme.colors.border,
            marginHorizontal: theme.spacing.xs,
        },
        stepLineCompleted: {
            backgroundColor: theme.colors.success,
        },
        stepText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            fontWeight: theme.typography.fontWeight.medium,
        },
        stepTextActive: {
            color: theme.colors.onPrimary,
        },
        sectionTitle: {
            marginBottom: theme.spacing.m,
            marginTop: theme.spacing.l,
        },
        activityList: {
            marginTop: theme.spacing.m,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            marginBottom: theme.spacing.s,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        activityEmoji: {
            fontSize: 24,
            marginRight: theme.spacing.m,
        },
        activityContent: {
            flex: 1,
        },
        activityTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
        },
        activityMeta: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
        },
        navigationButtons: {
            flexDirection: 'row',
            padding: theme.spacing.m,
            gap: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        navButton: {
            flex: 1,
        },
        emptyState: {
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        emptyText: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: theme.spacing.m,
        },
        settingsButtons: {
            flexDirection: 'row',
            gap: theme.spacing.m,
        },
        settingButton: {
            flex: 1,
        },
    }));

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
                    tags: loop.tags || [],
                    categoryId: loop.categoryId,
                });

                setActivities(loop.activities || []);
                setBackgroundExecution(loop.backgroundExecution);
                setNotifications(loop.notifications);
                setScheduling(loop.scheduling);
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

    // Handle metadata changes (auto-save in edit mode)
    const handleCategoryChange = async (newCategoryId: string | null) => {
        setValue('categoryId', newCategoryId || undefined);
        if (loopId && mode === 'edit') {
            await autoSave({ categoryId: newCategoryId || undefined });
        }
    };

    const handleLabelsChange = async (newLabels: string[]) => {
        setValue('tags', newLabels);
        if (loopId && mode === 'edit') {
            await autoSave({ tags: newLabels });
        }
    };

    const handleTitleChange = async (value: string) => {
        setValue('title', value);
        if (loopId && mode === 'edit') {
            await autoSave({ title: value });
        }
    };

    const autoSave = async (updates: Partial<LoopFormValues>) => {
        if (!loopId) return;

        try {
            const currentValues = getValues();
            const loopData = {
                ...currentValues,
                ...updates,
                activities,
                backgroundExecution,
                notifications,
                scheduling,
            };
            await updateLoop(loopId, loopData);
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    };

    // Step navigation
    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep((prev) => (prev + 1) as BuilderStep);
        }
    };

    const previousStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as BuilderStep);
        }
    };

    // Activity management
    const handleTemplateSelect = (template: ActivityTemplate) => {
        setSelectedTemplate(template);

        // Create new activity instance from template with guaranteed unique ID
        const newActivity: ActivityInstance = {
            id: generateUUID(),
            templateId: template.id,
            title: undefined, // Use template title by default
            quantity: undefined,
            duration: undefined,
            subItems: undefined,
            linkedTarget: template.linkedTarget,
            order: activities.length,
            status: 'pending',
        };

        setEditingActivity(newActivity);
        setShowActivityEditor(true);
    };

    const handleActivitySave = (activity: ActivityInstance) => {
        if (editingActivity && activities.find(a => a.id === editingActivity.id)) {
            // Update existing activity
            setActivities(prev => prev.map(a => a.id === activity.id ? activity : a));
        } else {
            // Add new activity, ensure no duplicates by ID
            setActivities(prev => {
                const existingActivity = prev.find(a => a.id === activity.id);
                if (existingActivity) {
                    // Update existing instead of adding duplicate
                    return prev.map(a => a.id === activity.id ? activity : a);
                } else {
                    // Add new activity
                    return [...prev, activity];
                }
            });
        }

        setShowActivityEditor(false);
        setEditingActivity(null);
        setSelectedTemplate(null);
    };

    const handleActivityEdit = (activity: ActivityInstance) => {
        const template = templates.find(t => t.id === activity.templateId);
        if (template) {
            setSelectedTemplate(template);
            setEditingActivity(activity);
            setShowActivityEditor(true);
        }
    };

    const handleActivityRemove = (activityId: string) => {
        setActivities(prev => prev.filter(a => a.id !== activityId));
    };

    const handleActivityReorder = (fromIndex: number, toIndex: number) => {
        setActivities(prev => {
            const newActivities = [...prev];
            const [removed] = newActivities.splice(fromIndex, 1);
            newActivities.splice(toIndex, 0, removed);

            // Update order values
            return newActivities.map((activity, index) => ({
                ...activity,
                order: index,
            }));
        });
    };

    // Form submission
    const onSubmit = async (data: LoopFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const loopData: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'> = {
                title: data.title,
                description: data.description,
                activities,
                tags: data.tags,
                categoryId: data.categoryId,
                backgroundExecution: data.backgroundExecution,
                notifications,
                scheduling,
            };

            let success;
            if (mode === 'edit' && loopId) {
                success = await updateLoop(loopId, loopData);
            } else {
                const newLoop = await createLoop(loopData);
                success = !!newLoop;
                if (success && newLoop) {
                    setLoopId(newLoop.id);
                    setMode('view');
                }
            }

            if (success) {
                await loadLoops(); // Refresh loops list
                Alert.alert('Success', 'Loop saved successfully!');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to save the loop. Please try again.');
            }
        } catch (error) {
            console.error('Error saving loop:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validation
    const canProceedToNextStep = () => {
        const values = getValues();

        switch (currentStep) {
            case 1:
                return values.title.trim().length > 0;
            case 2:
                return activities.length > 0;
            case 3:
                return true;
            default:
                return false;
        }
    };

    const canSaveLoop = () => {
        const values = getValues();
        return values.title.trim().length > 0 && activities.length > 0;
    };

    // Render step indicator
    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                    <View style={[
                        styles.stepDot,
                        currentStep === step && styles.stepDotActive,
                        currentStep > step && styles.stepDotCompleted,
                    ]}>
                        <Typography style={[
                            styles.stepText,
                            currentStep === step && styles.stepTextActive,
                        ]}>
                            {step}
                        </Typography>
                    </View>
                    {index < 2 && (
                        <View style={[
                            styles.stepLine,
                            currentStep > step && styles.stepLineCompleted,
                        ]} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            default:
                return null;
        }
    };

    // Step 1: Basic Info
    const renderStep1 = () => (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Typography variant="h3" style={styles.sectionTitle}>
                Basic Information
            </Typography>

            <EntryTitleInput
                control={control}
                name="title"
                placeholder="Enter loop title"
                onChangeText={handleTitleChange}
            />

            <FormTextarea
                name="description"
                control={control}
                label="Description"
                placeholder="Describe what this loop is for"
                numberOfLines={3}
            />
        </ScrollView>
    );

    // Step 2: Template Selection + Activity Customization
    const renderStep2 = () => (
        <View>
            <Typography variant="h3" style={styles.sectionTitle}>
                Add Activities
            </Typography>

            <ActivityTemplateSelector
                selectedTemplateIds={activities.map(a => a.templateId)}
                onTemplateToggle={(templateId) => {
                    const template = templates.find(t => t.id === templateId);
                    if (template) {
                        handleTemplateSelect(template);
                    }
                }}
                multiSelect={false}
            />

            {activities.length > 0 && (
                <View style={styles.activityList}>
                    <Typography variant="h4" style={styles.sectionTitle}>
                        Selected Activities ({activities.length})
                    </Typography>

                    {activities.map((activity, index) => {
                        const template = templates.find(t => t.id === activity.templateId);
                        return (
                            <View key={`${activity.id}-${index}`} style={styles.activityItem}>
                                <Typography style={styles.activityEmoji}>
                                    {template?.emoji || '⚡'}
                                </Typography>
                                <View style={styles.activityContent}>
                                    <Typography style={styles.activityTitle}>
                                        {activity.title || template?.title || 'Untitled Activity'}
                                    </Typography>
                                    <Typography style={styles.activityMeta}>
                                        {activity.duration ? `${activity.duration} min` : 'No duration set'}
                                        {activity.quantity && ` • ${activity.quantity.number} ${activity.quantity.unit}`}
                                    </Typography>
                                </View>
                                <Button
                                    variant="text"
                                    label="Edit"
                                    size="small"
                                    onPress={() => handleActivityEdit(activity)}
                                />
                            </View>
                        );
                    })}
                </View>
            )}

            {activities.length === 0 && (
                <View style={styles.emptyState}>
                    <Typography style={styles.emptyText}>
                        Select activity templates above to build your loop
                    </Typography>
                </View>
            )}
        </View>
    );

    // Step 3: Settings & Preview
    const renderStep3 = () => (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Typography variant="h3" style={styles.sectionTitle}>
                Settings & Review
            </Typography>

            {/* Loop Preview */}
            <LoopPreviewCard
                title={watch('title') || 'Untitled Loop'}
                description={watch('description')}
                activities={activities}
                templates={templates}
            />

            {/* Background Execution */}
            <Typography variant="h4" style={styles.sectionTitle}>
                Execution Settings
            </Typography>

            <FormSwitch
                name="backgroundExecution"
                control={control}
                label="Background Execution"
                helperText="Allow this loop to run in the background"
            />

            {/* Quick Settings Buttons */}
            <Typography variant="h4" style={styles.sectionTitle}>
                Additional Settings
            </Typography>

            <View style={styles.settingsButtons}>
                <Button
                    variant="outline"
                    label="Notification Settings"
                    onPress={() => setShowNotificationSettings(true)}
                    fullWidth
                    style={styles.settingButton}
                />

                <Button
                    variant="outline"
                    label="Scheduling Settings"
                    onPress={() => setShowSchedulingSettings(true)}
                    fullWidth
                    style={styles.settingButton}
                />
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
            >
                <EntryDetailHeader
                    entryType={mode === 'create' ? 'New Loop' : mode === 'edit' ? 'Edit Loop' : 'Loop'}
                    onBackPress={() => navigation.goBack()}
                />

                <EntryMetadataBar
                    categoryId={categoryId || null}
                    labels={labels}
                    onCategoryChange={handleCategoryChange}
                    onLabelsChange={handleLabelsChange}
                />

                {/* Step Indicator */}
                {renderStepIndicator()}

                {/* Dynamic Content Based on Step */}
                <View style={styles.content}>
                    {renderStepContent()}
                </View>

                {/* Navigation */}
                <View style={styles.navigationButtons}>
                    {currentStep > 1 && (
                        <Button
                            variant="secondary"
                            label="Previous"
                            onPress={previousStep}
                            style={styles.navButton}
                        />
                    )}

                    {currentStep < 3 ? (
                        <Button
                            variant="primary"
                            label="Next"
                            onPress={nextStep}
                            disabled={!canProceedToNextStep()}
                            style={styles.navButton}
                        />
                    ) : (
                        <Button
                            variant="primary"
                            label={mode === 'edit' ? 'Update Loop' : 'Create Loop'}
                            onPress={handleSubmit(onSubmit)}
                            disabled={!canSaveLoop() || isSubmitting}
                            isLoading={isSubmitting}
                            style={styles.navButton}
                        />
                    )}
                </View>

                {/* Activity Editor Bottom Sheet */}
                <BottomSheet
                    visible={showActivityEditor}
                    onClose={() => {
                        setShowActivityEditor(false);
                        setEditingActivity(null);
                        setSelectedTemplate(null);
                    }}
                >
                    {editingActivity && selectedTemplate && (
                        <ActivityInstanceEditor
                            activityInstance={editingActivity}
                            template={selectedTemplate}
                            onUpdate={handleActivitySave}
                            onDone={() => {
                                setShowActivityEditor(false);
                                setEditingActivity(null);
                                setSelectedTemplate(null);
                            }}
                        />
                    )}
                </BottomSheet>

                {/* Notification Settings Bottom Sheet */}
                <BottomSheet
                    visible={showNotificationSettings}
                    onClose={() => setShowNotificationSettings(false)}
                >
                    <LoopSettingsForm
                        type="notifications"
                        settings={notifications}
                        onSave={(settings) => setNotifications(settings as NotificationSettings)}
                        onCancel={() => setShowNotificationSettings(false)}
                    />
                </BottomSheet>

                {/* Scheduling Settings Bottom Sheet */}
                <BottomSheet
                    visible={showSchedulingSettings}
                    onClose={() => setShowSchedulingSettings(false)}
                >
                    <LoopSettingsForm
                        type="scheduling"
                        settings={scheduling}
                        onSave={(settings) => setScheduling(settings as ScheduleSettings)}
                        onCancel={() => setShowSchedulingSettings(false)}
                    />
                </BottomSheet>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 