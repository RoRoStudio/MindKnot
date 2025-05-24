import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    SafeAreaView,
    Alert
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useStyles } from '../../../hooks/useStyles';
import { Icon } from '../../common';
import {
    Loop,
    ActivityTemplate,
    LoopActivityInstance,
    NavigateTarget
} from '../../../types/loop';
import { useLoopActions } from '../../../store/loops/useLoopActions';
import { ActivityPicker } from './ActivityPicker';

interface LoopCreationFlowProps {
    visible: boolean;
    onClose: () => void;
    onLoopCreated: (loop: Loop) => void;
}

type CreationStep = 'details' | 'activities' | 'review';

interface LoopDraft {
    title: string;
    description: string;
    activityInstances: LoopActivityInstance[];
}

const initialDraft: LoopDraft = {
    title: '',
    description: '',
    activityInstances: []
};

export const LoopCreationFlow: React.FC<LoopCreationFlowProps> = ({
    visible,
    onClose,
    onLoopCreated,
}) => {
    const { theme } = useTheme();
    const { createLoop, loading, initializePredefinedActivityTemplates, activityTemplates, loadLoops } = useLoopActions();
    const [currentStep, setCurrentStep] = useState<CreationStep>('details');
    const [draft, setDraft] = useState<LoopDraft>(initialDraft);
    const [showActivityPicker, setShowActivityPicker] = useState(false);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        closeButton: {
            padding: 4,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        stepIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
        },
        stepDot: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 4,
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
        },
        stepLineCompleted: {
            backgroundColor: theme.colors.success,
        },
        stepNumber: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.background,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            marginBottom: 16,
        },
        inputGroup: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 8,
        },
        textInput: {
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
        },
        textArea: {
            minHeight: 80,
            textAlignVertical: 'top',
        },
        activitiesContainer: {
            marginBottom: 20,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        activityIcon: {
            fontSize: 24,
            marginRight: 12,
        },
        activityInfo: {
            flex: 1,
        },
        activityTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 4,
        },
        activityMeta: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        removeButton: {
            padding: 8,
        },
        addActivityButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            borderWidth: 2,
            borderColor: theme.colors.primary,
            borderStyle: 'dashed',
            borderRadius: 12,
            backgroundColor: theme.colors.primary + '10',
        },
        addActivityText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.primary,
            marginLeft: 8,
        },
        reviewSection: {
            marginBottom: 24,
        },
        reviewTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 8,
        },
        reviewText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            lineHeight: 22,
        },
        bottomActions: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            gap: 12,
        },
        actionButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
        },
        secondaryButton: {
            backgroundColor: theme.colors.border,
        },
        primaryButton: {
            backgroundColor: theme.colors.primary,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
        },
        secondaryButtonText: {
            color: theme.colors.textSecondary,
        },
        primaryButtonText: {
            color: theme.colors.background,
        },
        emptyState: {
            alignItems: 'center',
            padding: 24,
        },
        emptyStateText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: 16,
        },
    }));

    useEffect(() => {
        if (visible) {
            initializePredefinedActivityTemplates();
            setCurrentStep('details');
            setDraft(initialDraft);
        }
    }, [visible]);

    const isStepCompleted = (step: CreationStep): boolean => {
        switch (step) {
            case 'details':
                return draft.title.trim().length > 0;
            case 'activities':
                return draft.activityInstances.length > 0;
            case 'review':
                return false; // Review step is never "completed"
            default:
                return false;
        }
    };

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 'details':
                return draft.title.trim().length > 0;
            case 'activities':
                return draft.activityInstances.length > 0;
            case 'review':
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (!canProceed()) return;

        switch (currentStep) {
            case 'details':
                setCurrentStep('activities');
                break;
            case 'activities':
                setCurrentStep('review');
                break;
            case 'review':
                handleCreateLoop();
                break;
        }
    };

    const handleBack = () => {
        switch (currentStep) {
            case 'activities':
                setCurrentStep('details');
                break;
            case 'review':
                setCurrentStep('activities');
                break;
        }
    };

    const handleActivitySelect = (activityInstance: Omit<LoopActivityInstance, 'id'>) => {
        setDraft(prev => ({
            ...prev,
            activityInstances: [
                ...prev.activityInstances,
                {
                    ...activityInstance,
                    id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
                    order: prev.activityInstances.length
                }
            ]
        }));
    };

    const handleActivityReorder = (reorderedInstances: LoopActivityInstance[]) => {
        setDraft(prev => ({
            ...prev,
            activityInstances: reorderedInstances
        }));
    };

    const handleActivityRemove = (instanceId: string) => {
        setDraft(prev => ({
            ...prev,
            activityInstances: prev.activityInstances
                .filter(instance => instance.id !== instanceId)
                .map((instance, index) => ({
                    ...instance,
                    order: index
                }))
        }));
    };

    const handleActivityEdit = (instanceId: string, updates: Partial<LoopActivityInstance>) => {
        setDraft(prev => ({
            ...prev,
            activityInstances: prev.activityInstances.map(instance =>
                instance.id === instanceId
                    ? { ...instance, ...updates }
                    : instance
            )
        }));
    };

    const getActivityDisplayDetails = (instance: LoopActivityInstance) => {
        const details = [];

        if (instance.quantity) {
            details.push(`${instance.quantity.value} ${instance.quantity.unit}`);
        }

        if (instance.durationMinutes) {
            details.push(`${instance.durationMinutes} min`);
        }

        if (instance.subActions && instance.subActions.length > 0) {
            details.push(`${instance.subActions.length} sub-actions`);
        }

        return details.join(' • ');
    };

    const getActivityTitle = (instance: LoopActivityInstance) => {
        // Try to find the template by templateId
        const template = activityTemplates.find(t => t.id === instance.templateId);
        return instance.overriddenTitle || template?.title || `Activity ${instance.order + 1}`;
    };

    const getActivityIcon = (instance: LoopActivityInstance) => {
        // Try to find the template by templateId
        const template = activityTemplates.find(t => t.id === instance.templateId);
        return template?.icon || '📝';
    };

    const handleCreateLoop = async () => {
        try {
            const newLoop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'> = {
                type: 'loop',
                title: draft.title,
                description: draft.description || undefined,
                activityInstances: draft.activityInstances.map((instance) => ({
                    ...instance,
                    // Keep the temporary ID, let the API handle proper ID generation
                })),
                active: true,
                startDate: new Date().toISOString(),
                tags: [],
                isStarred: false
            };

            const success = await createLoop(newLoop);

            if (success) {
                // Reload loops to get the latest data
                await loadLoops();

                // Pass a minimal loop object - the parent will handle loading the full data
                const createdLoop: Loop = {
                    ...newLoop,
                    id: 'temp', // Temporary - the parent will load the actual data
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                onLoopCreated(createdLoop);
                onClose();
                setDraft(initialDraft);
            } else {
                Alert.alert('Error', 'Failed to create loop. Please try again.');
            }
        } catch (error) {
            console.error('Error creating loop:', error);
            Alert.alert('Error', 'Failed to create loop. Please try again.');
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {(['details', 'activities', 'review'] as CreationStep[]).map((step, index) => {
                const isActive = currentStep === step;
                const isCompleted = isStepCompleted(step);
                const showLine = index < 2;

                return (
                    <React.Fragment key={step}>
                        <View
                            style={[
                                styles.stepDot,
                                isActive && styles.stepDotActive,
                                isCompleted && styles.stepDotCompleted,
                            ]}
                        >
                            {isCompleted ? (
                                <Icon
                                    name="check"
                                    width={16}
                                    height={16}
                                    color={theme.colors.background}
                                />
                            ) : (
                                <Text style={styles.stepNumber}>{index + 1}</Text>
                            )}
                        </View>
                        {showLine && (
                            <View
                                style={[
                                    styles.stepLine,
                                    isCompleted && styles.stepLineCompleted,
                                ]}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </View>
    );

    const renderDetailsStep = () => (
        <View>
            <Text style={styles.sectionTitle}>Loop Details</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                    style={styles.textInput}
                    value={draft.title}
                    onChangeText={(text) => setDraft(prev => ({ ...prev, title: text }))}
                    placeholder="Enter loop name"
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={draft.description}
                    onChangeText={(text) => setDraft(prev => ({ ...prev, description: text }))}
                    placeholder="What is this loop for?"
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                />
            </View>
        </View>
    );

    const renderActivitiesStep = () => (
        <View>
            <Text style={styles.sectionTitle}>Activities</Text>

            <View style={styles.activitiesContainer}>
                {draft.activityInstances.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            No activities added yet.{'\n'}
                            Add your first activity to get started.
                        </Text>
                    </View>
                ) : (
                    draft.activityInstances.map((instance, index) => (
                        <View key={instance.id} style={styles.activityItem}>
                            <Text style={styles.activityIcon}>{getActivityIcon(instance)}</Text>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityTitle}>
                                    {getActivityTitle(instance)}
                                </Text>
                                <Text style={styles.activityMeta}>
                                    {getActivityDisplayDetails(instance) || 'No details'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleActivityRemove(instance.id)}
                            >
                                <Icon
                                    name="x"
                                    width={20}
                                    height={20}
                                    color={theme.colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>
                    ))
                )}

                <TouchableOpacity
                    style={styles.addActivityButton}
                    onPress={() => setShowActivityPicker(true)}
                >
                    <Icon
                        name="plus"
                        width={20}
                        height={20}
                        color={theme.colors.primary}
                    />
                    <Text style={styles.addActivityText}>Add Activity</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderReviewStep = () => (
        <View>
            <Text style={styles.sectionTitle}>Review</Text>

            <View style={styles.reviewSection}>
                <Text style={styles.reviewTitle}>Title</Text>
                <Text style={styles.reviewText}>{draft.title}</Text>
            </View>

            {draft.description && (
                <View style={styles.reviewSection}>
                    <Text style={styles.reviewTitle}>Description</Text>
                    <Text style={styles.reviewText}>{draft.description}</Text>
                </View>
            )}

            <View style={styles.reviewSection}>
                <Text style={styles.reviewTitle}>Activities ({draft.activityInstances.length})</Text>
                {draft.activityInstances.map((instance, index) => (
                    <View key={instance.id} style={styles.activityItem}>
                        <Text style={styles.activityIcon}>{getActivityIcon(instance)}</Text>
                        <View style={styles.activityInfo}>
                            <Text style={styles.activityTitle}>
                                {getActivityTitle(instance)}
                            </Text>
                            <Text style={styles.activityMeta}>
                                {getActivityDisplayDetails(instance) || 'No details'}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'details':
                return renderDetailsStep();
            case 'activities':
                return renderActivitiesStep();
            case 'review':
                return renderReviewStep();
            default:
                return null;
        }
    };

    return (
        <>
            <Modal
                visible={visible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Icon
                                name="x"
                                width={24}
                                height={24}
                                color={theme.colors.textSecondary}
                            />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Create Loop</Text>
                        <View style={{ width: 32 }} />
                    </View>

                    <ScrollView style={styles.content}>
                        {renderStepIndicator()}
                        {renderCurrentStep()}
                    </ScrollView>

                    <View style={styles.bottomActions}>
                        {currentStep !== 'details' && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.secondaryButton]}
                                onPress={handleBack}
                            >
                                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                                    Back
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                styles.primaryButton,
                                !canProceed() && { opacity: 0.5 }
                            ]}
                            onPress={handleNext}
                            disabled={!canProceed() || loading}
                        >
                            <Text style={[styles.buttonText, styles.primaryButtonText]}>
                                {currentStep === 'review'
                                    ? (loading ? 'Creating...' : 'Create Loop')
                                    : 'Next'
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

            <ActivityPicker
                visible={showActivityPicker}
                onClose={() => setShowActivityPicker(false)}
                onSelectActivity={handleActivitySelect}
                onReorderActivities={handleActivityReorder}
                onRemoveActivity={handleActivityRemove}
                onEditActivity={handleActivityEdit}
                selectedActivityInstances={draft.activityInstances}
            />
        </>
    );
}; 