import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { Icon } from '../../../shared/components';
import { Action } from '../../../shared/types/action';
import { BottomSheet } from '../../../shared/components';
import { getAllActions } from '../../actions/hooks/useActionService';
import { linkActionToPath } from '../hooks/usePathService';

interface ActionEmbedSheetProps {
    visible: boolean;
    onClose: () => void;
    pathId: string;
    milestoneId?: string;
    onActionLinked: () => void;
}

type FilterType = 'all' | 'unlinked' | 'starred';

export const ActionEmbedSheet: React.FC<ActionEmbedSheetProps> = ({
    visible,
    onClose,
    pathId,
    milestoneId,
    onActionLinked
}) => {
    const { theme } = useTheme();
    const [actions, setActions] = useState<Action[]>([]);
    const [filteredActions, setFilteredActions] = useState<Action[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('unlinked');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadActions();
        }
    }, [visible]);

    useEffect(() => {
        applyFilters();
    }, [actions, searchText, selectedFilter]);

    const loadActions = async () => {
        try {
            setIsLoading(true);
            const allActions = await getAllActions();
            setActions(allActions);
        } catch (error) {
            console.error('Error loading actions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...actions];

        // Apply filter type
        switch (selectedFilter) {
            case 'unlinked':
                filtered = filtered.filter(action => !action.parentId);
                break;
            case 'starred':
                filtered = filtered.filter(action => action.isStarred);
                break;
            // 'all' shows everything
        }

        // Apply search filter
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(action =>
                action.title.toLowerCase().includes(searchLower) ||
                action.description?.toLowerCase().includes(searchLower) ||
                action.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        setFilteredActions(filtered);
    };

    const handleLinkAction = async (action: Action) => {
        try {
            await linkActionToPath(action.id, pathId, milestoneId);
            onActionLinked();
            onClose();
        } catch (error) {
            console.error('Error linking action:', error);
        }
    };

    const renderFilterButton = (filter: FilterType, label: string, count: number) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(filter)}
        >
            <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive
            ]}>
                {label} ({count})
            </Text>
        </TouchableOpacity>
    );

    const renderActionItem = ({ item: action }: { item: Action }) => {
        const isLinked = Boolean(action.parentId);
        const completedSubTasks = action.subTasks?.filter(task => task.completed).length || 0;
        const totalSubTasks = action.subTasks?.length || 0;

        return (
            <TouchableOpacity
                style={[
                    styles.actionItem,
                    isLinked && styles.actionItemDisabled
                ]}
                onPress={() => !isLinked && handleLinkAction(action)}
                disabled={isLinked}
            >
                <View style={styles.actionHeader}>
                    <View style={styles.actionTitleContainer}>
                        <Text style={[
                            styles.actionTitle,
                            isLinked && styles.actionTitleDisabled
                        ]}>
                            {action.title}
                        </Text>
                        {isLinked && (
                            <View style={styles.linkedBadge}>
                                <Text style={styles.linkedBadgeText}>Linked</Text>
                            </View>
                        )}
                    </View>

                    {action.isStarred && (
                        <Icon name="star" width={16} height={16} color="#FFB800" />
                    )}
                </View>

                {action.description && (
                    <Text style={styles.actionDescription} numberOfLines={2}>
                        {action.description}
                    </Text>
                )}

                <View style={styles.actionMeta}>
                    {totalSubTasks > 0 && (
                        <Text style={styles.subTasksCount}>
                            {completedSubTasks}/{totalSubTasks} sub-actions
                        </Text>
                    )}

                    {action.dueDate && (
                        <Text style={styles.dueDate}>
                            Due: {new Date(action.dueDate).toLocaleDateString()}
                        </Text>
                    )}
                </View>

                {action.tags && action.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {action.tags.slice(0, 3).map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                        {action.tags.length > 3 && (
                            <Text style={styles.moreTagsText}>+{action.tags.length - 3}</Text>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const unlinkedCount = actions.filter(action => !action.parentId).length;
    const starredCount = actions.filter(action => action.isStarred).length;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
        },
        header: {
            marginBottom: 20,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 14,
            color: '#6B7280',
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 16,
        },
        searchInput: {
            flex: 1,
            paddingVertical: 12,
            fontSize: 16,
            color: '#111827',
        },
        filtersContainer: {
            flexDirection: 'row',
            marginBottom: 16,
            gap: 8,
        },
        filterButton: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: '#F3F4F6',
            borderWidth: 1,
            borderColor: '#D1D5DB',
        },
        filterButtonActive: {
            backgroundColor: '#8B5CF6',
            borderColor: '#8B5CF6',
        },
        filterButtonText: {
            fontSize: 14,
            color: '#6B7280',
            fontWeight: '500',
        },
        filterButtonTextActive: {
            color: '#FFFFFF',
        },
        actionsList: {
            flex: 1,
        },
        actionItem: {
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#E5E7EB',
        },
        actionItemDisabled: {
            opacity: 0.5,
        },
        actionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
        },
        actionTitleContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        actionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: '#111827',
            marginRight: 8,
        },
        actionTitleDisabled: {
            color: '#9CA3AF',
        },
        linkedBadge: {
            backgroundColor: '#FEF3C7',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 10,
        },
        linkedBadgeText: {
            fontSize: 12,
            color: '#92400E',
            fontWeight: '500',
        },
        actionDescription: {
            fontSize: 14,
            color: '#6B7280',
            marginBottom: 8,
            lineHeight: 20,
        },
        actionMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        subTasksCount: {
            fontSize: 12,
            color: '#6B7280',
            marginRight: 16,
        },
        dueDate: {
            fontSize: 12,
            color: '#6B7280',
        },
        tagsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
        },
        tag: {
            backgroundColor: '#EDE9FE',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 12,
            marginRight: 6,
            marginBottom: 4,
        },
        tagText: {
            fontSize: 12,
            color: '#7C3AED',
        },
        moreTagsText: {
            fontSize: 12,
            color: '#9CA3AF',
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 40,
        },
        emptyIcon: {
            marginBottom: 12,
        },
        emptyTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 4,
        },
        emptyText: {
            fontSize: 14,
            color: '#6B7280',
            textAlign: 'center',
        },
    });

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            snapPoints={[0.9]}
            dismissible={true}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Link Existing Action</Text>
                    <Text style={styles.subtitle}>
                        Choose an action to add to this {milestoneId ? 'milestone' : 'path'}
                    </Text>
                </View>

                <View style={styles.searchContainer}>
                    <Icon name="search" width={20} height={20} color="#6B7280" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search actions..."
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={styles.filtersContainer}>
                    {renderFilterButton('unlinked', 'Available', unlinkedCount)}
                    {renderFilterButton('starred', 'Starred', starredCount)}
                    {renderFilterButton('all', 'All', actions.length)}
                </View>

                {filteredActions.length > 0 ? (
                    <ScrollView
                        style={styles.actionsList}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredActions.map((action) => renderActionItem({ item: action }))}
                    </ScrollView>
                ) : (
                    <View style={styles.emptyState}>
                        <Icon name="search" width={48} height={48} color="#D1D5DB" style={styles.emptyIcon} />
                        <Text style={styles.emptyTitle}>No actions found</Text>
                        <Text style={styles.emptyText}>
                            {searchText ? 'Try adjusting your search terms' : 'No actions match the selected filter'}
                        </Text>
                    </View>
                )}
            </View>
        </BottomSheet>
    );
}; 