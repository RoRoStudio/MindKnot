import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Alert,
    StyleSheet,
    Dimensions,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { useTheme } from '../../../contexts/ThemeContext';
import { useLoopActions } from '../../../store/loops';
import { Icon } from '../../shared/Icon';
import { BottomSheet } from '../../shared/BottomSheet';
import {
    ActivityTemplate,
    LoopActivityInstance,
    ActivityQuantity,
    ActivitySubAction,
    NavigateTarget
} from '../../../types/loop';
import { generateSimpleId } from '../../../utils/uuidUtil';

const { width: screenWidth } = Dimensions.get('window');

interface ActivityPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelectActivity: (activityInstance: Omit<LoopActivityInstance, 'id'>) => void;
    selectedActivityInstances: LoopActivityInstance[]; // Updated to show selected instances
    onReorderActivities: (reorderedInstances: LoopActivityInstance[]) => void;
    onRemoveActivity: (instanceId: string) => void;
    onEditActivity: (instanceId: string, updates: Partial<LoopActivityInstance>) => void;
}

interface ActivityInstanceConfiguration {
    templateId: string;
    overriddenTitle?: string;
    quantity?: ActivityQuantity;
    durationMinutes?: number;
    subActions?: ActivitySubAction[];
    navigateTarget?: NavigateTarget;
    autoCompleteOnTimerEnd?: boolean;
}

interface ReorderableActivityListProps {
    instances: LoopActivityInstance[];
    templates: ActivityTemplate[];
    onReorder: (reorderedInstances: LoopActivityInstance[]) => void;
    onRemove: (instanceId: string) => void;
    onEdit: (instance: LoopActivityInstance) => void;
}

const ReorderableActivityList: React.FC<ReorderableActivityListProps> = ({
    instances,
    templates,
    onReorder,
    onRemove,
    onEdit
}) => {
    const { theme } = useTheme();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const getTemplateForInstance = (instance: LoopActivityInstance) => {
        return templates.find(t => t.id === instance.templateId);
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

    const moveActivity = (fromIndex: number, toIndex: number) => {
        const reordered = [...instances];
        const [movedItem] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, movedItem);

        // Update order values
        const withUpdatedOrder = reordered.map((instance, index) => ({
            ...instance,
            order: index
        }));

        onReorder(withUpdatedOrder);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (index: number) => {
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            moveActivity(draggedIndex, dragOverIndex);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragCancel = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const listStyles = StyleSheet.create({
        container: {
            flex: 1,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 16,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            marginBottom: 8,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        activityItemDragging: {
            opacity: 0.5,
            transform: [{ scale: 1.05 }],
        },
        activityItemDragOver: {
            borderColor: theme.colors.primary,
            borderWidth: 2,
        },
        dragHandle: {
            marginRight: 12,
            padding: 8,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
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
        reorderButtons: {
            flexDirection: 'column',
            marginHorizontal: 8,
        },
        reorderButton: {
            padding: 6,
            marginVertical: 2,
            borderRadius: 4,
            backgroundColor: theme.colors.surfaceVariant,
        },
        reorderButtonDisabled: {
            opacity: 0.3,
        },
        actionButtons: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 8,
        },
        editButton: {
            padding: 8,
            marginRight: 4,
            borderRadius: 4,
            backgroundColor: theme.colors.surfaceVariant,
        },
        removeButton: {
            padding: 8,
            marginLeft: 8,
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 40,
        },
        emptyStateText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: 16,
        },
    });

    if (instances.length === 0) {
        return (
            <View style={listStyles.container}>
                <Text style={listStyles.title}>Selected Activities</Text>
                <View style={listStyles.emptyState}>
                    <Text style={listStyles.emptyStateText}>
                        No activities added yet.{'\n'}
                        Select activities from the templates below.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={listStyles.container}>
            <Text style={listStyles.title}>Selected Activities ({instances.length})</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                {instances.map((instance, index) => {
                    const template = getTemplateForInstance(instance);
                    const displayTitle = instance.overriddenTitle || template?.title || `Activity ${index + 1}`;
                    const displayIcon = template?.icon || '📝';

                    return (
                        <View
                            key={instance.id}
                            style={[
                                listStyles.activityItem,
                                draggedIndex === index && listStyles.activityItemDragging,
                                dragOverIndex === index && listStyles.activityItemDragOver
                            ]}
                            onTouchMove={() => {
                                if (draggedIndex !== null) {
                                    handleDragOver(index);
                                }
                            }}
                            onTouchEnd={() => {
                                if (draggedIndex === index) {
                                    handleDragEnd();
                                }
                            }}
                        >
                            <TouchableOpacity
                                style={listStyles.dragHandle}
                                onLongPress={() => {
                                    handleDragStart(index);
                                }}
                                onPressOut={handleDragEnd}
                            >
                                <Icon name="ellipsis-vertical" size={20} color={theme.colors.textSecondary} />
                            </TouchableOpacity>

                            <Text style={listStyles.activityIcon}>{displayIcon}</Text>

                            <View style={listStyles.activityInfo}>
                                <Text style={listStyles.activityTitle}>{displayTitle}</Text>
                                <Text style={listStyles.activityMeta}>
                                    {getActivityDisplayDetails(instance) || 'No details'}
                                </Text>
                            </View>

                            <View style={listStyles.reorderButtons}>
                                <TouchableOpacity
                                    style={[
                                        listStyles.reorderButton,
                                        index === 0 && listStyles.reorderButtonDisabled
                                    ]}
                                    onPress={() => index > 0 && moveActivity(index, index - 1)}
                                    disabled={index === 0}
                                >
                                    <Icon
                                        name="chevron-up"
                                        size={16}
                                        color={index === 0 ? theme.colors.border : theme.colors.primary}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        listStyles.reorderButton,
                                        index === instances.length - 1 && listStyles.reorderButtonDisabled
                                    ]}
                                    onPress={() => index < instances.length - 1 && moveActivity(index, index + 1)}
                                    disabled={index === instances.length - 1}
                                >
                                    <Icon
                                        name="chevron-down"
                                        size={16}
                                        color={index === instances.length - 1 ? theme.colors.border : theme.colors.primary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={listStyles.actionButtons}>
                                <TouchableOpacity
                                    style={listStyles.editButton}
                                    onPress={() => onEdit(instance)}
                                >
                                    <Icon name="pencil" size={16} color={theme.colors.textSecondary} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={listStyles.removeButton}
                                    onPress={() => onRemove(instance.id)}
                                >
                                    <Icon name="x" size={20} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

interface CategoryTabProps {
    id: string;
    title: string;
    icon: string;
    isActive: boolean;
    onPress: () => void;
}

const CategoryTab: React.FC<CategoryTabProps> = ({ title, icon, isActive, onPress }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        categoryTab: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginRight: 8,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            minWidth: 80,
        },
        categoryTabActive: {
            backgroundColor: theme.colors.primary,
        },
        categoryIcon: {
            fontSize: 16,
            marginRight: 6,
        },
        categoryTitle: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.textPrimary,
        },
        categoryTitleActive: {
            color: theme.colors.background,
        },
    });

    return (
        <TouchableOpacity
            style={[
                styles.categoryTab,
                isActive && styles.categoryTabActive
            ]}
            onPress={onPress}
        >
            <Text style={styles.categoryIcon}>{icon}</Text>
            <Text style={[
                styles.categoryTitle,
                isActive && styles.categoryTitleActive
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

interface ActivityTemplateItemProps {
    template: ActivityTemplate;
    isSelected?: boolean;
    onPress: () => void;
}

const ActivityTemplateItem: React.FC<ActivityTemplateItemProps> = ({ template, isSelected, onPress }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        templateItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            marginBottom: 12,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: 'transparent',
        },
        templateItemSelected: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.primaryLight + '20',
        },
        templateIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        templateIconText: {
            fontSize: 24,
        },
        templateInfo: {
            flex: 1,
        },
        templateTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 2,
        },
        templateDescription: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 18,
        },
        selectedBadge: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    return (
        <TouchableOpacity
            style={[
                styles.templateItem,
                isSelected && styles.templateItemSelected
            ]}
            onPress={onPress}
        >
            <View style={styles.templateIcon}>
                <Text style={styles.templateIconText}>{template.icon}</Text>
            </View>
            <View style={styles.templateInfo}>
                <Text style={styles.templateTitle}>{template.title}</Text>
                {template.description && (
                    <Text style={styles.templateDescription}>{template.description}</Text>
                )}
            </View>
            {isSelected && (
                <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark" size={16} color={theme.colors.background} />
                </View>
            )}
        </TouchableOpacity>
    );
};

interface CreateActivityFormProps {
    onSubmit: (title: string, icon: string, description?: string) => void;
    onCancel: () => void;
}

interface ActivityConfigurationModalProps {
    visible: boolean;
    template: ActivityTemplate | null;
    editingInstance?: LoopActivityInstance | null;
    onConfirm: (configuration: ActivityInstanceConfiguration) => void;
    onCancel: () => void;
}

const ActivityConfigurationModal: React.FC<ActivityConfigurationModalProps> = ({
    visible,
    template,
    editingInstance,
    onConfirm,
    onCancel,
}) => {
    const { theme } = useTheme();
    const [overriddenTitle, setOverriddenTitle] = useState('');
    const [quantityValue, setQuantityValue] = useState('');
    const [quantityUnit, setQuantityUnit] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [subActions, setSubActions] = useState<string[]>([]);
    const [newSubAction, setNewSubAction] = useState('');
    const [hasCustomNavigation, setHasCustomNavigation] = useState(false);
    const [navigationType, setNavigationType] = useState<'note' | 'action' | 'spark' | 'path' | 'saga'>('note');
    const [navigationMode, setNavigationMode] = useState<'create' | 'review' | 'view' | 'select'>('view');
    const [autoCompleteOnTimerEnd, setAutoCompleteOnTimerEnd] = useState(true);
    const [editingSubActionIndex, setEditingSubActionIndex] = useState<number | null>(null);
    const [editingSubActionText, setEditingSubActionText] = useState('');

    useEffect(() => {
        if (template && visible) {
            if (editingInstance) {
                // Pre-fill with existing instance data
                setOverriddenTitle(editingInstance.overriddenTitle || '');
                setQuantityValue(editingInstance.quantity?.value?.toString() || '');
                setQuantityUnit(editingInstance.quantity?.unit || '');
                setDurationMinutes(editingInstance.durationMinutes?.toString() || '');
                setSubActions(editingInstance.subActions?.map(sa => sa.text) || []);
                setNewSubAction('');
                setHasCustomNavigation(!!editingInstance.navigateTarget);
                setNavigationType(editingInstance.navigateTarget?.type || 'note');
                setNavigationMode(editingInstance.navigateTarget?.mode || 'view');
                setAutoCompleteOnTimerEnd(editingInstance.autoCompleteOnTimerEnd !== false);
            } else {
                // Reset for new instance
                setOverriddenTitle('');
                setQuantityValue('');
                setQuantityUnit('');
                setDurationMinutes('');
                setSubActions([]);
                setNewSubAction('');
                setHasCustomNavigation(false);
                setNavigationType('note');
                setNavigationMode('view');
                setAutoCompleteOnTimerEnd(true);
            }
        }
    }, [template, visible, editingInstance]);

    const handleAddSubAction = () => {
        if (newSubAction.trim()) {
            setSubActions(prev => [...prev, newSubAction.trim()]);
            setNewSubAction('');
        }
    };

    const handleRemoveSubAction = (index: number) => {
        setSubActions(prev => prev.filter((_, i) => i !== index));
    };

    const handleStartEditSubAction = (index: number) => {
        setEditingSubActionIndex(index);
        setEditingSubActionText(subActions[index]);
    };

    const handleSaveEditSubAction = () => {
        if (editingSubActionIndex !== null && editingSubActionText.trim()) {
            setSubActions(prev => prev.map((action, index) =>
                index === editingSubActionIndex ? editingSubActionText.trim() : action
            ));
        }
        setEditingSubActionIndex(null);
        setEditingSubActionText('');
    };

    const handleCancelEditSubAction = () => {
        setEditingSubActionIndex(null);
        setEditingSubActionText('');
    };

    const handleConfirm = () => {
        if (!template) return;

        const configuration: ActivityInstanceConfiguration = {
            templateId: template.id,
            overriddenTitle: overriddenTitle.trim() || undefined,
            quantity: (quantityValue && quantityUnit) ? {
                value: parseInt(quantityValue),
                unit: quantityUnit
            } : undefined,
            durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
            subActions: subActions.length > 0 ? subActions.map(text => ({
                id: generateSimpleId(),
                text,
                done: false
            })) : undefined,
            navigateTarget: hasCustomNavigation ? {
                type: navigationType,
                mode: navigationMode
            } : template.navigateTarget,
            autoCompleteOnTimerEnd: autoCompleteOnTimerEnd
        };

        onConfirm(configuration);
        resetForm();
    };

    const resetForm = () => {
        setOverriddenTitle('');
        setQuantityValue('');
        setQuantityUnit('');
        setDurationMinutes('');
        setSubActions([]);
        setNewSubAction('');
        setHasCustomNavigation(false);
        setAutoCompleteOnTimerEnd(true);
        setEditingSubActionIndex(null);
        setEditingSubActionText('');
    };

    if (!template) return null;

    const modalStyles = StyleSheet.create({
        configModal: {
            flex: 1,
            padding: 20,
        },
        configHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        configTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        footerContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
        },
        cancelButton: {
            padding: 12,
            borderRadius: 8,
            backgroundColor: theme.colors.border,
            alignItems: 'center',
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        confirmButton: {
            padding: 12,
            borderRadius: 8,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
        },
        confirmButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.background,
        },
        templatePreview: {
            alignItems: 'center',
            paddingVertical: 20,
            marginBottom: 20,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
        },
        templatePreviewIcon: {
            fontSize: 40,
            marginBottom: 8,
        },
        templatePreviewTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 4,
        },
        templatePreviewDescription: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            paddingHorizontal: 20,
        },
        configSection: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 12,
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
        quantityRow: {
            flexDirection: 'row',
            gap: 12,
        },
        quantityInput: {
            flex: 1,
        },
        unitInput: {
            flex: 2,
        },
        subActionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
            marginBottom: 8,
        },
        subActionTextContainer: {
            flex: 1,
        },
        subActionText: {
            flex: 1,
            fontSize: 14,
            color: theme.colors.textPrimary,
        },
        editActionButton: {
            padding: 4,
            marginLeft: 4,
        },
        addSubActionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        subActionInput: {
            flex: 1,
        },
        addButton: {
            padding: 8,
        },
        navigationHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        navigationConfig: {
            marginTop: 12,
        },
        navigationLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.textSecondary,
            marginBottom: 8,
            marginTop: 12,
        },
        navigationOptions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        navigationOption: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: 'transparent',
        },
        navigationOptionActive: {
            backgroundColor: theme.colors.primaryLight + '20',
            borderColor: theme.colors.primary,
        },
        navigationOptionText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            fontWeight: '500',
            textTransform: 'capitalize',
        },
        navigationOptionTextActive: {
            color: theme.colors.primary,
        },
        toggleSwitch: {
            padding: 4,
            borderRadius: 8,
            backgroundColor: theme.colors.surface,
        },
        switchTrack: {
            width: 40,
            height: 20,
            borderRadius: 10,
            backgroundColor: theme.colors.surfaceVariant,
        },
        switchTrackActive: {
            backgroundColor: theme.colors.primary,
        },
        switchThumb: {
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: theme.colors.surface,
        },
        switchThumbActive: {
            backgroundColor: theme.colors.primary,
        },
        configContent: {
            flex: 1,
        },
        removeButton: {
            padding: 4,
            marginLeft: 4,
        },
    });

    return (
        <BottomSheet
            visible={visible}
            onClose={onCancel}
            snapPoints={[0.9, 0.7]}
            showDragIndicator={true}
            footerContent={
                <View style={modalStyles.footerContainer}>
                    <TouchableOpacity
                        style={modalStyles.cancelButton}
                        onPress={onCancel}
                    >
                        <Text style={modalStyles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={modalStyles.confirmButton}
                        onPress={handleConfirm}
                    >
                        <Text style={modalStyles.confirmButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            }
        >
            <View style={modalStyles.configModal}>
                <View style={modalStyles.configHeader}>
                    <Text style={modalStyles.configTitle}>Configure Activity</Text>
                </View>

                <ScrollView style={modalStyles.configContent} showsVerticalScrollIndicator={false}>
                    {/* Template Info */}
                    <View style={modalStyles.templatePreview}>
                        <Text style={modalStyles.templatePreviewIcon}>{template.icon}</Text>
                        <Text style={modalStyles.templatePreviewTitle}>{template.title}</Text>
                        {template.description && (
                            <Text style={modalStyles.templatePreviewDescription}>{template.description}</Text>
                        )}
                    </View>

                    {/* Custom Title */}
                    <View style={modalStyles.configSection}>
                        <Text style={modalStyles.sectionTitle}>Custom Title (Optional)</Text>
                        <TextInput
                            style={modalStyles.textInput}
                            value={overriddenTitle}
                            onChangeText={setOverriddenTitle}
                            placeholder={`Default: ${template.title}`}
                            placeholderTextColor={theme.colors.textSecondary}
                        />
                    </View>

                    {/* Quantity */}
                    <View style={modalStyles.configSection}>
                        <Text style={modalStyles.sectionTitle}>Quantity (Optional)</Text>
                        <View style={modalStyles.quantityRow}>
                            <TextInput
                                style={[modalStyles.textInput, modalStyles.quantityInput]}
                                value={quantityValue}
                                onChangeText={setQuantityValue}
                                placeholder="Number"
                                placeholderTextColor={theme.colors.textSecondary}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[modalStyles.textInput, modalStyles.unitInput]}
                                value={quantityUnit}
                                onChangeText={setQuantityUnit}
                                placeholder="Unit (e.g., pages, reps)"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>
                    </View>

                    {/* Duration */}
                    <View style={modalStyles.configSection}>
                        <Text style={modalStyles.sectionTitle}>Duration (Optional)</Text>
                        <TextInput
                            style={modalStyles.textInput}
                            value={durationMinutes}
                            onChangeText={setDurationMinutes}
                            placeholder="Minutes"
                            placeholderTextColor={theme.colors.textSecondary}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Timer Behavior */}
                    {durationMinutes && parseInt(durationMinutes) > 0 && (
                        <View style={modalStyles.configSection}>
                            <View style={modalStyles.navigationHeader}>
                                <Text style={modalStyles.sectionTitle}>Timer Behavior</Text>
                            </View>
                            <View style={modalStyles.navigationConfig}>
                                <Text style={modalStyles.navigationLabel}>When timer ends:</Text>
                                <View style={modalStyles.navigationOptions}>
                                    <TouchableOpacity
                                        style={[
                                            modalStyles.navigationOption,
                                            autoCompleteOnTimerEnd && modalStyles.navigationOptionActive
                                        ]}
                                        onPress={() => setAutoCompleteOnTimerEnd(true)}
                                    >
                                        <Text style={[
                                            modalStyles.navigationOptionText,
                                            autoCompleteOnTimerEnd && modalStyles.navigationOptionTextActive
                                        ]}>
                                            Auto-complete activity
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            modalStyles.navigationOption,
                                            !autoCompleteOnTimerEnd && modalStyles.navigationOptionActive
                                        ]}
                                        onPress={() => setAutoCompleteOnTimerEnd(false)}
                                    >
                                        <Text style={[
                                            modalStyles.navigationOptionText,
                                            !autoCompleteOnTimerEnd && modalStyles.navigationOptionTextActive
                                        ]}>
                                            Count up (show overtime)
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Sub-actions */}
                    <View style={modalStyles.configSection}>
                        <Text style={modalStyles.sectionTitle}>Sub-actions (Optional)</Text>
                        {subActions.map((action, index) => (
                            <View key={index} style={modalStyles.subActionItem}>
                                {editingSubActionIndex === index ? (
                                    <>
                                        <TextInput
                                            style={[modalStyles.textInput, { flex: 1, marginRight: 8 }]}
                                            value={editingSubActionText}
                                            onChangeText={setEditingSubActionText}
                                            onSubmitEditing={handleSaveEditSubAction}
                                            autoFocus
                                            placeholder="Sub-action text..."
                                            placeholderTextColor={theme.colors.textSecondary}
                                        />
                                        <TouchableOpacity
                                            onPress={handleSaveEditSubAction}
                                            style={modalStyles.editActionButton}
                                        >
                                            <Ionicons name="checkmark" size={16} color={theme.colors.success} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleCancelEditSubAction}
                                            style={modalStyles.editActionButton}
                                        >
                                            <Ionicons name="close" size={16} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={modalStyles.subActionTextContainer}
                                            onPress={() => handleStartEditSubAction(index)}
                                        >
                                            <Text style={modalStyles.subActionText}>{action}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveSubAction(index)}
                                            style={modalStyles.removeButton}
                                        >
                                            <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        ))}
                        <View style={modalStyles.addSubActionRow}>
                            <TextInput
                                style={[modalStyles.textInput, modalStyles.subActionInput]}
                                value={newSubAction}
                                onChangeText={setNewSubAction}
                                placeholder="Add sub-action..."
                                placeholderTextColor={theme.colors.textSecondary}
                                onSubmitEditing={handleAddSubAction}
                            />
                            <TouchableOpacity
                                onPress={handleAddSubAction}
                                style={modalStyles.addButton}
                            >
                                <Ionicons name="add" size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Navigation Target */}
                    <View style={modalStyles.configSection}>
                        <View style={modalStyles.navigationHeader}>
                            <Text style={modalStyles.sectionTitle}>Custom Navigation</Text>
                            <TouchableOpacity
                                style={modalStyles.toggleSwitch}
                                onPress={() => setHasCustomNavigation(!hasCustomNavigation)}
                            >
                                <View style={[
                                    modalStyles.switchTrack,
                                    hasCustomNavigation && modalStyles.switchTrackActive
                                ]}>
                                    <View style={[
                                        modalStyles.switchThumb,
                                        hasCustomNavigation && modalStyles.switchThumbActive
                                    ]} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {hasCustomNavigation && (
                            <View style={modalStyles.navigationConfig}>
                                <Text style={modalStyles.navigationLabel}>Target Type</Text>
                                <View style={modalStyles.navigationOptions}>
                                    {(['note', 'action', 'spark', 'path', 'saga'] as const).map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                modalStyles.navigationOption,
                                                navigationType === type && modalStyles.navigationOptionActive
                                            ]}
                                            onPress={() => setNavigationType(type)}
                                        >
                                            <Text style={[
                                                modalStyles.navigationOptionText,
                                                navigationType === type && modalStyles.navigationOptionTextActive
                                            ]}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={modalStyles.navigationLabel}>Mode</Text>
                                <View style={modalStyles.navigationOptions}>
                                    {(['create', 'review', 'view', 'select'] as const).map((mode) => (
                                        <TouchableOpacity
                                            key={mode}
                                            style={[
                                                modalStyles.navigationOption,
                                                navigationMode === mode && modalStyles.navigationOptionActive
                                            ]}
                                            onPress={() => setNavigationMode(mode)}
                                        >
                                            <Text style={[
                                                modalStyles.navigationOptionText,
                                                navigationMode === mode && modalStyles.navigationOptionTextActive
                                            ]}>
                                                {mode}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </BottomSheet>
    );
};

const CreateActivityForm: React.FC<CreateActivityFormProps> = ({ onSubmit, onCancel }) => {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('');
    const [description, setDescription] = useState('');

    const commonIcons = ['📝', '🏃', '🧘', '📖', '🎯', '💡', '🔍', '⏰', '📋', '🎨', '🎵', '🌱'];

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title for the activity');
            return;
        }
        if (!icon.trim()) {
            Alert.alert('Error', 'Please select an icon for the activity');
            return;
        }

        onSubmit(title.trim(), icon, description.trim() || undefined);
        setTitle('');
        setIcon('');
        setDescription('');
    };

    const formStyles = StyleSheet.create({
        createForm: {
            flex: 1,
            padding: 20,
        },
        createFormTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            marginBottom: 24,
            textAlign: 'center',
        },
        formSection: {
            marginBottom: 20,
        },
        formLabel: {
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
        iconGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 12,
        },
        iconOption: {
            width: 44,
            height: 44,
            margin: 4,
            borderRadius: 8,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: 'transparent',
        },
        iconOptionSelected: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.primaryLight + '20',
        },
        iconOptionText: {
            fontSize: 20,
        },
        formActions: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 20,
        },
        cancelFormButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: theme.colors.border,
            alignItems: 'center',
        },
        cancelFormButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        submitFormButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
        },
        submitFormButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.background,
        },
    });

    return (
        <View style={formStyles.createForm}>
            <Text style={formStyles.createFormTitle}>Create Custom Activity</Text>

            <View style={formStyles.formSection}>
                <Text style={formStyles.formLabel}>Title</Text>
                <TextInput
                    style={formStyles.textInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Activity name"
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            <View style={formStyles.formSection}>
                <Text style={formStyles.formLabel}>Description (Optional)</Text>
                <TextInput
                    style={formStyles.textInput}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What is this activity about?"
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                />
            </View>

            <View style={formStyles.formSection}>
                <Text style={formStyles.formLabel}>Icon</Text>
                <View style={formStyles.iconGrid}>
                    {commonIcons.map((emoji) => (
                        <TouchableOpacity
                            key={emoji}
                            style={[
                                formStyles.iconOption,
                                icon === emoji && formStyles.iconOptionSelected
                            ]}
                            onPress={() => setIcon(emoji)}
                        >
                            <Text style={formStyles.iconOptionText}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TextInput
                    style={formStyles.textInput}
                    value={icon}
                    onChangeText={setIcon}
                    placeholder="Or type custom emoji"
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            <View style={formStyles.formActions}>
                <TouchableOpacity style={formStyles.cancelFormButton} onPress={onCancel}>
                    <Text style={formStyles.cancelFormButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={formStyles.submitFormButton} onPress={handleSubmit}>
                    <Text style={formStyles.submitFormButtonText}>Create</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const ActivityPicker: React.FC<ActivityPickerProps> = ({
    visible,
    onClose,
    onSelectActivity,
    selectedActivityInstances,
    onReorderActivities,
    onRemoveActivity,
    onEditActivity,
}) => {
    const { theme } = useTheme();
    const {
        activityTemplatesByCategory,
        activityTemplates,
        loadActivityTemplates,
        createActivityTemplate,
        initializePredefinedActivityTemplates
    } = useLoopActions();

    const [activeCategory, setActiveCategory] = useState<'mind' | 'body' | 'planning' | 'review' | 'custom'>('mind');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'templates'>('list');
    const [configurationModal, setConfigurationModal] = useState<{
        visible: boolean;
        template: ActivityTemplate | null;
        editingInstance?: LoopActivityInstance | null;
    }>({ visible: false, template: null, editingInstance: null });

    useEffect(() => {
        if (visible) {
            initializeData();
        }
    }, [visible]);

    const initializeData = async () => {
        await initializePredefinedActivityTemplates();
        await loadActivityTemplates();
    };

    const getCurrentCategoryTemplates = () => {
        return activityTemplatesByCategory[activeCategory] || [];
    };

    const handleCreateActivity = async (title: string, icon: string, description?: string) => {
        const success = await createActivityTemplate({
            title,
            icon,
            description,
            type: 'custom',
            isPredefined: false
        });

        if (success) {
            setShowCreateForm(false);
            await loadActivityTemplates();
        } else {
            Alert.alert('Error', 'Failed to create activity template');
        }
    };

    const handleTemplateSelect = (template: ActivityTemplate) => {
        setConfigurationModal({ visible: true, template });
    };

    const handleConfigurationConfirm = (configuration: ActivityInstanceConfiguration) => {
        if (configurationModal.editingInstance) {
            // Update existing instance
            const updates: Partial<LoopActivityInstance> = {
                overriddenTitle: configuration.overriddenTitle,
                quantity: configuration.quantity,
                durationMinutes: configuration.durationMinutes,
                subActions: configuration.subActions,
                navigateTarget: configuration.navigateTarget,
                autoCompleteOnTimerEnd: configuration.autoCompleteOnTimerEnd
            };
            onEditActivity(configurationModal.editingInstance.id, updates);
        } else {
            // Create new instance
            const activityInstance: Omit<LoopActivityInstance, 'id'> = {
                templateId: configuration.templateId,
                overriddenTitle: configuration.overriddenTitle,
                quantity: configuration.quantity,
                durationMinutes: configuration.durationMinutes,
                subActions: configuration.subActions,
                navigateTarget: configuration.navigateTarget,
                autoCompleteOnTimerEnd: configuration.autoCompleteOnTimerEnd,
                order: selectedActivityInstances.length // Next order position
            };
            onSelectActivity(activityInstance);
        }

        setConfigurationModal({ visible: false, template: null, editingInstance: null });
        setViewMode('list'); // Return to list view after adding/editing
    };

    const categories = [
        { id: 'mind', title: 'Mind', icon: '🧠' },
        { id: 'body', title: 'Body', icon: '💪' },
        { id: 'planning', title: 'Plan', icon: '📋' },
        { id: 'review', title: 'Review', icon: '🔍' },
        { id: 'custom', title: 'Custom', icon: '⭐' },
    ];

    const styles = StyleSheet.create({
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
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        addButton: {
            padding: 4,
        },
        viewToggle: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            backgroundColor: theme.colors.surface,
        },
        viewToggleText: {
            fontSize: 12,
            fontWeight: '500',
            color: theme.colors.textSecondary,
            marginLeft: 4,
        },
        categoryTabs: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: theme.colors.surface,
        },
        content: {
            flex: 1,
            padding: 20,
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.border,
            marginVertical: 16,
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
        },
        emptyStateText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginBottom: 16,
            textAlign: 'center',
        },
        createFirstButton: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.primary,
        },
        createFirstButtonText: {
            fontSize: 14,
            color: theme.colors.primary,
            fontWeight: '500',
        },
        doneButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            backgroundColor: theme.colors.primary,
            marginRight: 8,
        },
        doneButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.background,
        },
    });

    return (
        <>
            <Modal
                visible={visible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Compose Activities</Text>
                        <View style={styles.headerActions}>
                            {viewMode === 'list' && selectedActivityInstances.length > 0 && (
                                <TouchableOpacity
                                    style={styles.doneButton}
                                    onPress={onClose}
                                >
                                    <Text style={styles.doneButtonText}>Done</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.viewToggle}
                                onPress={() => setViewMode(viewMode === 'list' ? 'templates' : 'list')}
                            >
                                <Ionicons
                                    name={viewMode === 'list' ? 'add' : 'list'}
                                    size={16}
                                    color={theme.colors.textSecondary}
                                />
                                <Text style={styles.viewToggleText}>
                                    {viewMode === 'list' ? 'Add' : 'List'}
                                </Text>
                            </TouchableOpacity>
                            {viewMode === 'templates' && (
                                <TouchableOpacity
                                    onPress={() => setShowCreateForm(true)}
                                    style={styles.addButton}
                                >
                                    <Ionicons name="add" size={24} color={theme.colors.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {showCreateForm ? (
                        <CreateActivityForm
                            onSubmit={handleCreateActivity}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    ) : (
                        <ScrollView style={styles.content}>
                            {viewMode === 'list' ? (
                                <>
                                    <ReorderableActivityList
                                        instances={selectedActivityInstances}
                                        templates={activityTemplates}
                                        onReorder={onReorderActivities}
                                        onRemove={onRemoveActivity}
                                        onEdit={(instance) => {
                                            const template = activityTemplates.find(t => t.id === instance.templateId);
                                            if (template) {
                                                setConfigurationModal({
                                                    visible: true,
                                                    template,
                                                    editingInstance: instance
                                                });
                                            }
                                        }}
                                    />

                                    {selectedActivityInstances.length > 0 && (
                                        <>
                                            <View style={styles.divider} />
                                            <TouchableOpacity
                                                style={styles.createFirstButton}
                                                onPress={() => setViewMode('templates')}
                                            >
                                                <Text style={styles.createFirstButtonText}>
                                                    Add More Activities
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <ScrollView
                                        horizontal
                                        style={styles.categoryTabs}
                                        showsHorizontalScrollIndicator={false}
                                    >
                                        {categories.map((category) => (
                                            <CategoryTab
                                                key={category.id}
                                                id={category.id}
                                                title={category.title}
                                                icon={category.icon}
                                                isActive={activeCategory === category.id}
                                                onPress={() => setActiveCategory(category.id as any)}
                                            />
                                        ))}
                                    </ScrollView>

                                    {getCurrentCategoryTemplates().map((template) => (
                                        <ActivityTemplateItem
                                            key={template.id}
                                            template={template}
                                            isSelected={selectedActivityInstances.some(instance => instance.templateId === template.id)}
                                            onPress={() => handleTemplateSelect(template)}
                                        />
                                    ))}

                                    {getCurrentCategoryTemplates().length === 0 && (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyStateText}>
                                                No activities in this category yet
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.createFirstButton}
                                                onPress={() => setShowCreateForm(true)}
                                            >
                                                <Text style={styles.createFirstButtonText}>
                                                    Create the first one
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </>
                            )}
                        </ScrollView>
                    )}
                </SafeAreaView>
            </Modal>

            <ActivityConfigurationModal
                visible={configurationModal.visible}
                template={configurationModal.template}
                editingInstance={configurationModal.editingInstance}
                onConfirm={handleConfigurationConfirm}
                onCancel={() => setConfigurationModal({ visible: false, template: null, editingInstance: null })}
            />
        </>
    );
}; 