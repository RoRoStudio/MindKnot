/**
 * LoopBuilderScreen - Beautiful multi-step loop builder
 * Features modern design with proper theme adherence and inline components
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { Typography, Icon, Button } from '../../../shared/components';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { useActivityTemplates } from '../hooks/useActivityTemplates';
import { useLoops } from '../hooks/useLoops';
import { RootStackParamList } from '../../../shared/types/navigation';
import { Loop, ActivityInstance, ActivityTemplate, NotificationSettings } from '../../../shared/types/loop';
import { generateUUID } from '../../../shared/utils/uuid';

type LoopBuilderMode = 'create' | 'edit';

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
type BuilderStep = 1 | 2 | 3;

interface LoopFormData {
    title: string;
    description: string;
    tags: string[];
    categoryId?: string;
    activities: ActivityInstance[];
    backgroundExecution: boolean;
    notifications: NotificationSettings;
}

export default function LoopBuilderScreen() {
    const route = useRoute<LoopBuilderRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { createLoop, updateLoop, getLoopById } = useLoops();
    const { templates } = useActivityTemplates();

    // State management
    const [currentStep, setCurrentStep] = useState<BuilderStep>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form data
    const [formData, setFormData] = useState<LoopFormData>({
        title: '',
        description: '',
        tags: [],
        categoryId: undefined,
        activities: [],
        backgroundExecution: true,
        notifications: {
            enabled: true,
            activityReminders: true,
            sessionProgress: true,
            completionCelebration: true,
            soundEnabled: true,
            vibrationEnabled: true,
            persistentOverlay: false,
        },
    });

    // Activity builder state
    const [selectedTemplates, setSelectedTemplates] = useState<ActivityTemplate[]>([]);
    const [editingActivity, setEditingActivity] = useState<ActivityInstance | null>(null);
    const [showActivityEditor, setShowActivityEditor] = useState(false);

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.l,
            backgroundColor: theme.colors.surface,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            ...theme.elevation.m,
        },
        headerTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.m,
        },
        backButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.neutral[100],
            alignItems: 'center',
            justifyContent: 'center',
        },
        saveButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 22,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            minWidth: 80,
            alignItems: 'center',
        },
        saveButtonText: {
            color: theme.colors.onPrimary,
            ...theme.typography.preset.button,
            fontWeight: '600',
        },
        headerTitle: {
            color: theme.colors.textPrimary,
            ...theme.typography.preset.heading2,
            textAlign: 'center',
            flex: 1,
            marginHorizontal: theme.spacing.m,
        },
        // Step indicator
        stepIndicator: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.spacing.l,
        },
        stepContainer: {
            alignItems: 'center',
            flex: 1,
        },
        stepCircle: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.neutral[200],
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.s,
        },
        stepCircleActive: {
            backgroundColor: theme.colors.primary,
        },
        stepCircleCompleted: {
            backgroundColor: theme.colors.success,
        },
        stepLabel: {
            color: theme.colors.textSecondary,
            ...theme.typography.preset.caption,
            textAlign: 'center',
        },
        stepLabelActive: {
            color: theme.colors.primary,
            fontWeight: '600',
        },
        stepConnector: {
            height: 2,
            backgroundColor: theme.colors.neutral[200],
            flex: 1,
            marginHorizontal: theme.spacing.s,
            marginTop: 20,
        },
        stepConnectorCompleted: {
            backgroundColor: theme.colors.success,
        },
        // Content
        content: {
            flex: 1,
        },
        scrollContent: {
            padding: theme.spacing.l,
        },
        // Form styles
        inputCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 28,
            padding: theme.spacing.l,
            marginBottom: theme.spacing.l,
            ...theme.elevation.s,
        },
        inputLabel: {
            color: theme.colors.textPrimary,
            ...theme.typography.preset.heading5,
            marginBottom: theme.spacing.m,
        },
        textInput: {
            backgroundColor: theme.colors.neutral[50],
            borderRadius: 16,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.m,
            color: theme.colors.textPrimary,
            ...theme.typography.preset.body1,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        textArea: {
            minHeight: 100,
            textAlignVertical: 'top',
        },
        tagContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.s,
            marginTop: theme.spacing.m,
        },
        tag: {
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            backgroundColor: theme.colors.secondary,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.s,
        },
        tagText: {
            color: theme.colors.onSecondary,
            ...theme.typography.preset.caption,
        },
        tagInput: {
            backgroundColor: theme.colors.neutral[100],
            borderRadius: 16,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            color: theme.colors.textPrimary,
            ...theme.typography.preset.body2,
            marginTop: theme.spacing.m,
        },
        // Template selection
        templateGrid: {
            gap: theme.spacing.m,
        },
        templateCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            padding: theme.spacing.l,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'transparent',
        },
        templateCardSelected: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.brand.primary[50],
        },
        templateIcon: {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.m,
        },
        templateTitle: {
            color: theme.colors.textPrimary,
            ...theme.typography.preset.heading6,
            textAlign: 'center',
            marginBottom: theme.spacing.s,
        },
        templateDescription: {
            color: theme.colors.textSecondary,
            ...theme.typography.preset.caption,
            textAlign: 'center',
        },
        // Activity list
        activityItem: {
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
            ...theme.elevation.s,
        },
        activityIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.m,
        },
        activityInfo: {
            flex: 1,
        },
        activityTitle: {
            color: theme.colors.textPrimary,
            ...theme.typography.preset.heading6,
            marginBottom: theme.spacing.xs,
        },
        activityMeta: {
            color: theme.colors.textSecondary,
            ...theme.typography.preset.caption,
        },
        activityActions: {
            flexDirection: 'row',
            gap: theme.spacing.s,
        },
        activityActionButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.neutral[100],
            alignItems: 'center',
            justifyContent: 'center',
        },
        // Activity editor
        editorOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.l,
        },
        editorCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 28,
            padding: theme.spacing.l,
            width: '100%',
            maxHeight: '80%',
            ...theme.elevation.xl,
        },
        editorHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.l,
        },
        editorTitle: {
            color: theme.colors.textPrimary,
            ...theme.typography.preset.heading3,
        },
        closeButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.neutral[100],
            alignItems: 'center',
            justifyContent: 'center',
        },
        // Settings
        settingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: theme.spacing.m,
        },
        settingLabel: {
            color: theme.colors.textPrimary,
            ...theme.typography.preset.body1,
            flex: 1,
        },
        settingDescription: {
            color: theme.colors.textSecondary,
            ...theme.typography.preset.caption,
            marginTop: theme.spacing.xs,
        },
        switch: {
            width: 50,
            height: 30,
            borderRadius: 15,
            backgroundColor: theme.colors.neutral[200],
            justifyContent: 'center',
            paddingHorizontal: 2,
        },
        switchActive: {
            backgroundColor: theme.colors.primary,
        },
        switchThumb: {
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: theme.colors.onPrimary,
            ...theme.elevation.s,
        },
        switchThumbActive: {
            alignSelf: 'flex-end',
        },
        // Navigation
        navigationContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: theme.spacing.l,
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            ...theme.elevation.m,
        },
        navButton: {
            borderRadius: 28,
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            minWidth: 100,
            alignItems: 'center',
        },
        navButtonPrimary: {
            backgroundColor: theme.colors.primary,
        },
        navButtonSecondary: {
            backgroundColor: theme.colors.neutral[100],
        },
        navButtonText: {
            ...theme.typography.preset.button,
        },
        navButtonTextPrimary: {
            color: theme.colors.onPrimary,
        },
        navButtonTextSecondary: {
            color: theme.colors.textPrimary,
        },
        // Add activity button
        addActivityButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 28,
            paddingVertical: theme.spacing.m,
            marginTop: theme.spacing.l,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: theme.spacing.s,
        },
        addActivityButtonText: {
            color: theme.colors.onPrimary,
            ...theme.typography.preset.button,
            fontWeight: '600',
        },
    }));

    // Load existing loop data for edit mode
    useEffect(() => {
        const loadExistingLoop = async () => {
            if (route.params.mode === 'edit' && route.params.id) {
                setIsLoading(true);
                try {
                    const loop = await getLoopById(route.params.id);
                    if (loop) {
                        setFormData({
                            title: loop.title,
                            description: loop.description || '',
                            tags: loop.tags || [],
                            categoryId: loop.categoryId,
                            activities: loop.activities,
                            backgroundExecution: loop.backgroundExecution || true,
                            notifications: loop.notifications || formData.notifications,
                        });
                    }
                } catch (error) {
                    Alert.alert('Error', 'Failed to load loop data');
                    navigation.goBack();
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadExistingLoop();
    }, [route.params.mode, route.params.id, getLoopById, navigation]);

    // Form handlers
    const updateFormData = useCallback((updates: Partial<LoopFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    const addTag = useCallback((tag: string) => {
        if (tag.trim() && !formData.tags.includes(tag.trim())) {
            updateFormData({ tags: [...formData.tags, tag.trim()] });
        }
    }, [formData.tags, updateFormData]);

    const removeTag = useCallback((tagToRemove: string) => {
        updateFormData({ tags: formData.tags.filter(tag => tag !== tagToRemove) });
    }, [formData.tags, updateFormData]);

    // Activity management
    const addActivityFromTemplate = useCallback((template: ActivityTemplate) => {
        const newActivity: ActivityInstance = {
            id: generateUUID(),
            templateId: template.id,
            title: template.title,
            description: template.description,
            duration: template.defaultDuration || 0,
            quantity: template.quantity,
            subItems: template.subItems?.map(item => ({
                id: generateUUID(),
                title: item.title,
                completed: false,
            })) || [],
        };

        setEditingActivity(newActivity);
        setShowActivityEditor(true);
    }, []);

    const saveActivity = useCallback((activity: ActivityInstance) => {
        const existingIndex = formData.activities.findIndex(a => a.id === activity.id);
        let newActivities: ActivityInstance[];

        if (existingIndex >= 0) {
            newActivities = [...formData.activities];
            newActivities[existingIndex] = activity;
        } else {
            newActivities = [...formData.activities, activity];
        }

        updateFormData({ activities: newActivities });
        setShowActivityEditor(false);
        setEditingActivity(null);
    }, [formData.activities, updateFormData]);

    const removeActivity = useCallback((activityId: string) => {
        updateFormData({
            activities: formData.activities.filter(a => a.id !== activityId)
        });
    }, [formData.activities, updateFormData]);

    const editActivity = useCallback((activity: ActivityInstance) => {
        setEditingActivity(activity);
        setShowActivityEditor(true);
    }, []);

    // Navigation
    const canProceedToNextStep = useCallback(() => {
        switch (currentStep) {
            case 1: return formData.title.trim().length > 0;
            case 2: return formData.activities.length > 0;
            case 3: return true;
            default: return false;
        }
    }, [currentStep, formData.title, formData.activities.length]);

    const nextStep = useCallback(() => {
        if (currentStep < 3 && canProceedToNextStep()) {
            setCurrentStep((prev) => (prev + 1) as BuilderStep);
        }
    }, [currentStep, canProceedToNextStep]);

    const previousStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as BuilderStep);
        }
    }, [currentStep]);

    // Save loop
    const saveLoop = useCallback(async () => {
        if (!formData.title.trim() || formData.activities.length === 0) {
            Alert.alert('Validation Error', 'Please provide a title and at least one activity.');
            return;
        }

        setIsSaving(true);
        try {
            const loopData: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'> = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                tags: formData.tags,
                categoryId: formData.categoryId,
                activities: formData.activities,
                backgroundExecution: formData.backgroundExecution,
                notifications: formData.notifications,
            };

            if (route.params.mode === 'edit' && route.params.id) {
                await updateLoop(route.params.id, loopData);
            } else {
                await createLoop(loopData);
            }

            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save loop');
        } finally {
            setIsSaving(false);
        }
    }, [formData, route.params.mode, route.params.id, createLoop, updateLoop, navigation]);

    // Step 1: Basic Information
    const renderStep1 = () => (
        <View>
            <View style={styles.inputCard}>
                <Typography style={styles.inputLabel}>
                    Loop Title *
                </Typography>
                <TextInput
                    style={styles.textInput}
                    value={formData.title}
                    onChangeText={(text) => updateFormData({ title: text })}
                    placeholder="Enter loop title..."
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            <View style={styles.inputCard}>
                <Typography style={styles.inputLabel}>
                    Description
                </Typography>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => updateFormData({ description: text })}
                    placeholder="Describe your loop..."
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={4}
                />
            </View>

            <View style={styles.inputCard}>
                <Typography style={styles.inputLabel}>
                    Tags
                </Typography>
                {formData.tags.length > 0 && (
                    <View style={styles.tagContainer}>
                        {formData.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Typography style={styles.tagText}>{tag}</Typography>
                                <TouchableOpacity onPress={() => removeTag(tag)}>
                                    <Icon name="x" size={12} color={theme.colors.onSecondary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
                <TextInput
                    style={styles.tagInput}
                    placeholder="Add tags..."
                    placeholderTextColor={theme.colors.textSecondary}
                    onSubmitEditing={(e) => {
                        addTag(e.nativeEvent.text);
                        e.target.clear();
                    }}
                    returnKeyType="done"
                />
            </View>
        </View>
    );

    // Step 2: Activity Selection
    const renderStep2 = () => (
        <View>
            <View style={styles.inputCard}>
                <Typography style={styles.inputLabel}>
                    Select Activity Templates
                </Typography>
                <FlatList
                    data={templates}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.templateCard}
                            onPress={() => addActivityFromTemplate(item)}
                        >
                            <View style={styles.templateIcon}>
                                <Icon name="zap" size={24} color={theme.colors.onPrimary} />
                            </View>
                            <Typography style={styles.templateTitle}>
                                {item.title}
                            </Typography>
                            <Typography style={styles.templateDescription}>
                                {item.description}
                            </Typography>
                        </TouchableOpacity>
                    )}
                    numColumns={2}
                    columnWrapperStyle={styles.templateGrid}
                    key="templates"
                    scrollEnabled={false}
                />
            </View>

            {formData.activities.length > 0 && (
                <View style={styles.inputCard}>
                    <Typography style={styles.inputLabel}>
                        Activities ({formData.activities.length})
                    </Typography>
                    {formData.activities.map((activity, index) => (
                        <View key={activity.id} style={styles.activityItem}>
                            <View style={styles.activityIcon}>
                                <Icon name="zap" size={20} color={theme.colors.onPrimary} />
                            </View>
                            <View style={styles.activityInfo}>
                                <Typography style={styles.activityTitle}>
                                    {activity.title}
                                </Typography>
                                <Typography style={styles.activityMeta}>
                                    {activity.duration ? `${activity.duration} min` : 'No duration'} •
                                    {activity.subItems?.length || 0} sub-tasks
                                </Typography>
                            </View>
                            <View style={styles.activityActions}>
                                <TouchableOpacity
                                    style={styles.activityActionButton}
                                    onPress={() => editActivity(activity)}
                                >
                                    <Icon name="pencil" size={14} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.activityActionButton}
                                    onPress={() => removeActivity(activity.id)}
                                >
                                    <Icon name="trash" size={14} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    // Step 3: Settings
    const renderStep3 = () => (
        <View>
            <View style={styles.inputCard}>
                <Typography style={styles.inputLabel}>
                    Loop Settings
                </Typography>

                <View style={styles.settingRow}>
                    <View style={{ flex: 1 }}>
                        <Typography style={styles.settingLabel}>
                            Background Execution
                        </Typography>
                        <Typography style={styles.settingDescription}>
                            Allow loop to continue in background
                        </Typography>
                    </View>
                    <TouchableOpacity
                        style={[styles.switch, formData.backgroundExecution && styles.switchActive]}
                        onPress={() => updateFormData({ backgroundExecution: !formData.backgroundExecution })}
                    >
                        <View style={[styles.switchThumb, formData.backgroundExecution && styles.switchThumbActive]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.settingRow}>
                    <View style={{ flex: 1 }}>
                        <Typography style={styles.settingLabel}>
                            Notifications
                        </Typography>
                        <Typography style={styles.settingDescription}>
                            Get notified about loop progress
                        </Typography>
                    </View>
                    <TouchableOpacity
                        style={[styles.switch, formData.notifications.enabled && styles.switchActive]}
                        onPress={() => updateFormData({
                            notifications: { ...formData.notifications, enabled: !formData.notifications.enabled }
                        })}
                    >
                        <View style={[styles.switchThumb, formData.notifications.enabled && styles.switchThumbActive]} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.inputCard}>
                <Typography style={styles.inputLabel}>
                    Summary
                </Typography>
                <View style={styles.settingRow}>
                    <Typography style={styles.settingLabel}>Title</Typography>
                    <Typography style={styles.settingDescription}>{formData.title}</Typography>
                </View>
                <View style={styles.settingRow}>
                    <Typography style={styles.settingLabel}>Activities</Typography>
                    <Typography style={styles.settingDescription}>{formData.activities.length}</Typography>
                </View>
                <View style={styles.settingRow}>
                    <Typography style={styles.settingLabel}>Total Duration</Typography>
                    <Typography style={styles.settingDescription}>
                        {formData.activities.reduce((sum, activity) => sum + (activity.duration || 0), 0)} minutes
                    </Typography>
                </View>
            </View>
        </View>
    );

    // Activity Editor Modal
    const renderActivityEditor = () => {
        if (!showActivityEditor || !editingActivity) return null;

        return (
            <View style={styles.editorOverlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    onPress={() => setShowActivityEditor(false)}
                />
                <View style={styles.editorCard}>
                    <View style={styles.editorHeader}>
                        <Typography style={styles.editorTitle}>
                            Edit Activity
                        </Typography>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowActivityEditor(false)}
                        >
                            <Icon name="x" size={18} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Typography style={styles.inputLabel}>Activity Title</Typography>
                        <TextInput
                            style={styles.textInput}
                            value={editingActivity.title}
                            onChangeText={(text) => setEditingActivity({ ...editingActivity, title: text })}
                            placeholder="Activity title..."
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <Typography style={[styles.inputLabel, { marginTop: theme.spacing.l }]}>
                            Duration (minutes)
                        </Typography>
                        <TextInput
                            style={styles.textInput}
                            value={editingActivity.duration?.toString() || ''}
                            onChangeText={(text) => setEditingActivity({
                                ...editingActivity,
                                duration: parseInt(text) || 0
                            })}
                            placeholder="0"
                            placeholderTextColor={theme.colors.textSecondary}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            style={styles.addActivityButton}
                            onPress={() => saveActivity(editingActivity)}
                        >
                            <Typography style={styles.addActivityButtonText}>
                                Save Activity
                            </Typography>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        );
    };

    // Step indicator
    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                    <View style={styles.stepContainer}>
                        <View style={[
                            styles.stepCircle,
                            currentStep === step && styles.stepCircleActive,
                            currentStep > step && styles.stepCircleCompleted,
                        ]}>
                            {currentStep > step ? (
                                <Icon name="check" size={20} color={theme.colors.onPrimary} />
                            ) : (
                                <Typography style={[
                                    styles.stepLabel,
                                    currentStep === step && { color: theme.colors.onPrimary }
                                ]}>
                                    {step}
                                </Typography>
                            )}
                        </View>
                        <Typography style={[
                            styles.stepLabel,
                            currentStep === step && styles.stepLabelActive,
                        ]}>
                            {step === 1 ? 'Info' : step === 2 ? 'Activities' : 'Settings'}
                        </Typography>
                    </View>
                    {index < 2 && (
                        <View style={[
                            styles.stepConnector,
                            currentStep > step && styles.stepConnectorCompleted,
                        ]} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>

                    <Typography style={styles.headerTitle}>
                        {route.params.mode === 'edit' ? 'Edit Loop' : 'Create Loop'}
                    </Typography>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={saveLoop}
                        disabled={isSaving}
                    >
                        <Typography style={styles.saveButtonText}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </Typography>
                    </TouchableOpacity>
                </View>

                {renderStepIndicator()}
            </View>

            {/* Content */}
            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </ScrollView>

                {/* Navigation */}
                <View style={styles.navigationContainer}>
                    <TouchableOpacity
                        style={[styles.navButton, styles.navButtonSecondary]}
                        onPress={previousStep}
                        disabled={currentStep === 1}
                    >
                        <Typography style={[styles.navButtonText, styles.navButtonTextSecondary]}>
                            Previous
                        </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navButton, styles.navButtonPrimary]}
                        onPress={currentStep === 3 ? saveLoop : nextStep}
                        disabled={!canProceedToNextStep() || isSaving}
                    >
                        <Typography style={[styles.navButtonText, styles.navButtonTextPrimary]}>
                            {currentStep === 3 ? (isSaving ? 'Saving...' : 'Finish') : 'Next'}
                        </Typography>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Activity Editor Modal */}
            {renderActivityEditor()}
        </SafeAreaView>
    );
} 