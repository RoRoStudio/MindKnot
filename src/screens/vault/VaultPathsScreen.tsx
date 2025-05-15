// src/screens/vault/VaultPathsScreen.tsx
import React, { useMemo } from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import { BaseVaultScreen } from './BaseVaultScreen';
import { usePaths } from '../../hooks/usePaths';
import { PathCard } from '../../components/entries';
import { Path } from '../../types/path';
import { useStyles } from '../../hooks/useStyles';
import { useBottomSheet } from '../../contexts/BottomSheetContext';
import { useVaultFilters } from '../../contexts/VaultFiltersContext';
import { VaultSearchHeader } from './VaultSearchHeader';
import { VaultEmptyState } from './VaultEmptyState';
import { Typography } from '../../components/common/Typography';
import { Card } from '../../components/common/Card';
import { Icon } from '../../components/common/Icon';

export default function VaultPathsScreen() {
    const { paths, loadPaths } = usePaths();
    const { showPathForm } = useBottomSheet();
    const { searchTerm, selectedTags, categoryId, sort } = useVaultFilters();

    // Extract all unique tags from paths
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        paths.forEach(path => path.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [paths]);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        pathContainer: {
            margin: theme.spacing.m,
            marginBottom: theme.spacing.l,
        },
        timeline: {
            position: 'absolute',
            left: 15,
            top: 75,
            bottom: 0,
            width: 2,
            backgroundColor: theme.colors.divider,
            zIndex: -1,
        },
        pathHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        pathIcon: {
            backgroundColor: theme.colors.primary,
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.s,
        },
        pathTitle: {
            flex: 1,
        },
        pathDates: {
            marginVertical: theme.spacing.xs,
            color: theme.colors.textSecondary,
        },
        milestoneContainer: {
            marginLeft: 16,
            marginTop: theme.spacing.s,
        },
        milestone: {
            flexDirection: 'row',
            marginBottom: theme.spacing.s,
        },
        milestoneMarker: {
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: theme.colors.secondary,
            marginRight: theme.spacing.s,
            marginTop: 4,
        },
        milestoneContent: {
            flex: 1,
        },
        progressBar: {
            height: 4,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 2,
            marginVertical: theme.spacing.s,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.success,
        },
    }));

    // Function to filter paths based on search term, tags, and category
    const filterPaths = (path: Path) => {
        // Filter by category
        if (categoryId && path.categoryId !== categoryId) {
            return false;
        }

        // Filter by selected tags
        if (selectedTags.length > 0 && !selectedTags.every(tag => path.tags?.includes(tag))) {
            return false;
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                path.title?.toLowerCase().includes(searchLower) ||
                path.description?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    };

    // Get filtered and sorted paths
    const filteredPaths = useMemo(() => {
        let filtered = paths.filter(filterPaths);

        return filtered.sort((a, b) => {
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
        });
    }, [paths, searchTerm, selectedTags, categoryId, sort]);

    // Calculate path progress
    const calculateProgress = (path: Path) => {
        if (!path.milestones || path.milestones.length === 0) {
            return 0;
        }

        let completedActions = 0;
        let totalActions = 0;

        path.milestones.forEach(milestone => {
            if (milestone.actions && milestone.actions.length > 0) {
                totalActions += milestone.actions.length;
                completedActions += milestone.actions.filter(action => action.done).length;
            }
        });

        if (totalActions === 0) {
            return 0;
        }

        return (completedActions / totalActions) * 100;
    };

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString();
    };

    // Custom render for path with timeline
    const renderPath = ({ item }: { item: Path }) => {
        const progress = calculateProgress(item);
        const startDate = formatDate(item.startDate);
        const targetDate = formatDate(item.targetDate);

        return (
            <View style={styles.pathContainer}>
                <Card elevated>
                    <View style={styles.pathHeader}>
                        <View style={styles.pathIcon}>
                            <Icon name="compass" width={18} height={18} color="#FFFFFF" />
                        </View>
                        <Typography variant="h3" style={styles.pathTitle}>
                            {item.title}
                        </Typography>
                    </View>

                    {item.description && (
                        <Typography variant="body2" style={{ marginBottom: 8 }}>
                            {item.description}
                        </Typography>
                    )}

                    {(startDate || targetDate) && (
                        <Typography variant="caption" style={styles.pathDates}>
                            {startDate ? `Started: ${startDate}` : ''}
                            {startDate && targetDate ? ' • ' : ''}
                            {targetDate ? `Target: ${targetDate}` : ''}
                        </Typography>
                    )}

                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>

                    {item.milestones && item.milestones.length > 0 && (
                        <View style={styles.milestoneContainer}>
                            {item.milestones.slice(0, 3).map((milestone, index) => (
                                <View key={milestone.id} style={styles.milestone}>
                                    <View style={styles.milestoneMarker} />
                                    <View style={styles.milestoneContent}>
                                        <Typography variant="body1">{milestone.title}</Typography>
                                        {milestone.description && (
                                            <Typography variant="caption">{milestone.description}</Typography>
                                        )}
                                    </View>
                                </View>
                            ))}

                            {item.milestones.length > 3 && (
                                <Typography variant="caption" color="secondary">
                                    +{item.milestones.length - 3} more milestones
                                </Typography>
                            )}
                        </View>
                    )}
                </Card>
                <View style={styles.timeline} />
            </View>
        );
    };

    // Check if filters are applied
    const hasFiltersApplied = searchTerm !== '' || selectedTags.length > 0 || categoryId !== null;

    return (
        <View style={styles.container}>
            <VaultSearchHeader allTags={allTags} />

            {filteredPaths.length === 0 ? (
                <VaultEmptyState
                    type="paths"
                    onCreatePress={showPathForm}
                    icon="compass"
                    hasFiltersApplied={hasFiltersApplied}
                />
            ) : (
                <FlatList
                    data={filteredPaths}
                    renderItem={renderPath}
                    keyExtractor={(item) => item.id}
                />
            )}
        </View>
    );
}