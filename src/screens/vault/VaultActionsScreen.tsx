// src/screens/vault/VaultActionsScreen.tsx
import React, { useMemo } from 'react';
import { View, SectionList, Text } from 'react-native';
import { useActions } from '../../hooks/useActions';
import { ActionCard } from '../../components/entries';
import { Action } from '../../types/action';
import { useStyles } from '../../hooks/useStyles';
import { useBottomSheet } from '../../contexts/BottomSheetContext';
import { useVaultFilters } from '../../contexts/VaultFiltersContext';
import { VaultSearchHeader } from './VaultSearchHeader';
import { VaultEmptyState } from './VaultEmptyState';
import { Typography } from '../../components/common/Typography';

export default function VaultActionsScreen() {
    const { actions, loadActions, toggleActionDone } = useActions();
    const { showActionForm } = useBottomSheet();
    const { searchTerm, selectedTags, categoryId, sort } = useVaultFilters();

    // Extract all unique tags from actions
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        actions.forEach(action => action.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [actions]);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        sectionHeader: {
            backgroundColor: theme.colors.surfaceVariant,
            padding: theme.spacing.m,
            borderRadius: theme.shape.radius.m,
            marginVertical: theme.spacing.s,
            marginHorizontal: theme.spacing.m,
        },
        sectionHeaderText: {
            fontWeight: 'bold',
        },
        itemContainer: {
            marginHorizontal: theme.spacing.m,
        },
    }));

    // Function to filter actions based on search term, tags, and category
    const filterActions = (action: Action) => {
        // Filter by category
        if (categoryId && action.categoryId !== categoryId) {
            return false;
        }

        // Filter by selected tags
        if (selectedTags.length > 0 && !selectedTags.every(tag => action.tags?.includes(tag))) {
            return false;
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                action.title?.toLowerCase().includes(searchLower) ||
                action.body?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    };

    // Group actions by status and due date
    const groupedActions = useMemo(() => {
        // Filter actions first
        const filteredActions = actions.filter(filterActions);

        const now = new Date();
        now.setHours(0, 0, 0, 0); // Start of today

        const overdue = [] as Action[];
        const today = [] as Action[];
        const upcoming = [] as Action[];
        const later = [] as Action[];
        const completed = [] as Action[];

        filteredActions.forEach(action => {
            if (action.done) {
                completed.push(action);
                return;
            }

            if (!action.dueDate) {
                later.push(action);
                return;
            }

            const dueDate = new Date(action.dueDate);
            dueDate.setHours(0, 0, 0, 0); // Start of due date

            if (dueDate < now) {
                overdue.push(action);
            } else if (dueDate.getTime() === now.getTime()) {
                today.push(action);
            } else {
                const nextWeek = new Date(now);
                nextWeek.setDate(nextWeek.getDate() + 7);

                if (dueDate < nextWeek) {
                    upcoming.push(action);
                } else {
                    later.push(action);
                }
            }
        });

        // Sort each section based on the selected sort order
        const sortFn = (a: Action, b: Action) => {
            switch (sort) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        };

        overdue.sort(sortFn);
        today.sort(sortFn);
        upcoming.sort(sortFn);
        later.sort(sortFn);
        completed.sort(sortFn);

        // Create sections
        const sections = [];

        if (overdue.length > 0) {
            sections.push({ title: 'Overdue', data: overdue });
        }

        if (today.length > 0) {
            sections.push({ title: 'Today', data: today });
        }

        if (upcoming.length > 0) {
            sections.push({ title: 'Upcoming', data: upcoming });
        }

        if (later.length > 0) {
            sections.push({ title: 'Later', data: later });
        }

        if (completed.length > 0) {
            sections.push({ title: 'Completed', data: completed });
        }

        return sections;
    }, [actions, searchTerm, selectedTags, categoryId, sort]);

    // Check if filters are applied
    const hasFiltersApplied = searchTerm !== '' || selectedTags.length > 0 || categoryId !== null;

    return (
        <View style={styles.container}>
            <VaultSearchHeader allTags={allTags} />

            {groupedActions.length === 0 ? (
                <VaultEmptyState
                    type="actions"
                    onCreatePress={showActionForm}
                    icon="check"
                    hasFiltersApplied={hasFiltersApplied}
                />
            ) : (
                <SectionList
                    sections={groupedActions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.itemContainer}>
                            <ActionCard
                                action={item}
                                onToggleDone={toggleActionDone}
                            />
                        </View>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <Typography variant="h4" style={styles.sectionHeaderText}>
                                {title}
                            </Typography>
                        </View>
                    )}
                />
            )}
        </View>
    );
}