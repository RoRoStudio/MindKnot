import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Milestone } from '../../../shared/types/path';
import { Action } from '../../../shared/types/action';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { Icon } from '../../../shared/components';
import { ActionCard } from '../../actions/components/ActionCard';
import { updateMilestone, deleteMilestone, getPathActions } from '../hooks/usePathService';
import { createAction } from '../../actions/hooks/useActionService';

interface MilestoneSectionProps {
    milestone: Milestone;
    onMilestoneUpdate: (milestone: Milestone) => Promise<void>;
    onMilestoneDelete: (milestoneId: string) => Promise<void>;
    onActionUpdate: () => Promise<void>;
    onLinkExistingAction: (milestoneId: string) => void;
    isEditing: boolean;
}

export const MilestoneSection: React.FC<MilestoneSectionProps> = ({
    milestone,
    onMilestoneUpdate,
    onMilestoneDelete,
    onActionUpdate,
    onLinkExistingAction,
    isEditing
}) => {
    const { theme } = useTheme();
    const [collapsed, setCollapsed] = useState(milestone.collapsed || false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleText, setTitleText] = useState(milestone.title);
    const [actions, setActions] = useState<Action[]>([]);
    const [isLoadingActions, setIsLoadingActions] = useState(false);

    // Load actions for this milestone
    useEffect(() => {
        loadMilestoneActions();
    }, [milestone.id]);

    const loadMilestoneActions = async () => {
        try {
            setIsLoadingActions(true);
            const milestoneActions = await getPathActions(milestone.pathId, milestone.id);
            setActions(milestoneActions);
        } catch (error) {
            console.error('Error loading milestone actions:', error);
        } finally {
            setIsLoadingActions(false);
        }
    };

    const handleToggleCollapse = async () => {
        const newCollapsed = !collapsed;
        setCollapsed(newCollapsed);

        if (isEditing) {
            try {
                await updateMilestone(milestone.id, { collapsed: newCollapsed });
                await onMilestoneUpdate({ ...milestone, collapsed: newCollapsed });
            } catch (error) {
                console.error('Error updating milestone collapse state:', error);
            }
        }
    };

    const handleTitleSave = async () => {
        if (titleText.trim() && titleText !== milestone.title) {
            try {
                await updateMilestone(milestone.id, { title: titleText.trim() });
                await onMilestoneUpdate({ ...milestone, title: titleText.trim() });
            } catch (error) {
                console.error('Error updating milestone title:', error);
                setTitleText(milestone.title); // Revert on error
            }
        }
        setEditingTitle(false);
    };

    const handleDeleteMilestone = () => {
        Alert.alert(
            'Delete Milestone',
            `Are you sure you want to delete "${milestone.title}"? All actions in this milestone will be moved to ungrouped actions.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMilestone(milestone.id);
                            await onMilestoneDelete(milestone.id);
                        } catch (error) {
                            console.error('Error deleting milestone:', error);
                            Alert.alert('Error', 'Failed to delete milestone');
                        }
                    }
                }
            ]
        );
    };

    const handleCreateAction = async () => {
        try {
            const newAction = await createAction({
                title: 'New Action',
                description: '',
                done: false,
                completed: false,
                priority: 0,
                tags: [],
                parentId: milestone.id,
                parentType: 'milestone'
            });

            if (newAction) {
                await loadMilestoneActions();
                await onActionUpdate();
            }
        } catch (error) {
            console.error('Error creating action:', error);
            Alert.alert('Error', 'Failed to create action');
        }
    };

    const handleActionToggleDone = async (actionId: string) => {
        await loadMilestoneActions();
        await onActionUpdate();
    };

    const styles = StyleSheet.create({
        container: {
            marginBottom: 16,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            overflow: 'hidden',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: '#F9FAFB',
            borderBottomWidth: collapsed ? 0 : 1,
            borderBottomColor: '#E5E7EB',
        },
        iconContainer: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: '#8B5CF6',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        titleContainer: {
            flex: 1,
        },
        titleInput: {
            fontSize: 16,
            fontWeight: '600',
            color: '#111827',
            padding: 0,
        },
        titleText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#111827',
        },
        actionCounter: {
            fontSize: 12,
            color: '#6B7280',
            marginTop: 2,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        headerButton: {
            padding: 8,
            marginLeft: 4,
        },
        content: {
            padding: 16,
        },
        actionsContainer: {
            gap: 12,
        },
        addActionButtons: {
            flexDirection: 'row',
            gap: 8,
            marginTop: 12,
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: '#F3F4F6',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderStyle: 'dashed',
        },
        addButtonText: {
            fontSize: 14,
            color: '#6B7280',
            marginLeft: 8,
            fontWeight: '500',
        },
        emptyState: {
            alignItems: 'center',
            padding: 24,
        },
        emptyText: {
            fontSize: 14,
            color: '#9CA3AF',
            marginTop: 8,
        },
    });

    const completedCount = actions.filter(action => action.done).length;
    const totalCount = actions.length;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={handleToggleCollapse}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    <Icon name="flag" width={16} height={16} color="#FFFFFF" />
                </View>

                <View style={styles.titleContainer}>
                    {editingTitle && isEditing ? (
                        <TextInput
                            style={styles.titleInput}
                            value={titleText}
                            onChangeText={setTitleText}
                            onBlur={handleTitleSave}
                            onSubmitEditing={handleTitleSave}
                            autoFocus
                            returnKeyType="done"
                        />
                    ) : (
                        <TouchableOpacity
                            onPress={() => isEditing && setEditingTitle(true)}
                            disabled={!isEditing}
                        >
                            <Text style={styles.titleText}>{milestone.title}</Text>
                        </TouchableOpacity>
                    )}

                    {totalCount > 0 && (
                        <Text style={styles.actionCounter}>
                            {completedCount} of {totalCount} completed
                        </Text>
                    )}
                </View>

                <View style={styles.headerActions}>
                    {isEditing && (
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={handleDeleteMilestone}
                        >
                            <Icon name="trash-2" width={16} height={16} color="#EF4444" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={handleToggleCollapse}
                    >
                        <Icon
                            name={collapsed ? "chevron-down" : "chevron-up"}
                            width={20}
                            height={20}
                            color="#6B7280"
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {!collapsed && (
                <View style={styles.content}>
                    {actions.length > 0 ? (
                        <View style={styles.actionsContainer}>
                            {actions.map((action) => (
                                <ActionCard
                                    key={action.id}
                                    action={action}
                                    onToggleDone={handleActionToggleDone}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="circle-plus" width={24} height={24} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No actions yet</Text>
                        </View>
                    )}

                    {isEditing && (
                        <View style={styles.addActionButtons}>
                            <TouchableOpacity
                                style={[styles.addButton, { flex: 1 }]}
                                onPress={handleCreateAction}
                            >
                                <Icon name="plus" width={16} height={16} color="#6B7280" />
                                <Text style={styles.addButtonText}>Add Action</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.addButton, { flex: 1 }]}
                                onPress={() => onLinkExistingAction(milestone.id)}
                            >
                                <Icon name="link" width={16} height={16} color="#6B7280" />
                                <Text style={styles.addButtonText}>Link Existing</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}; 