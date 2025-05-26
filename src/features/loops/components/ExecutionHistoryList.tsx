import React from 'react';
import { View, FlatList } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Typography, Card, Icon, Badge } from '../../../shared/components';
import { StyleProps } from '../../../shared/components/shared-props';
import { ExecutionHistory } from '../../../shared/types/loop';

export interface ExecutionHistoryListProps extends StyleProps {
    /**
     * List of execution history records
     */
    history: ExecutionHistory[];

    /**
     * Callback when a history item is pressed
     */
    onItemPress?: (item: ExecutionHistory) => void;

    /**
     * Whether to show detailed information
     */
    showDetails?: boolean;

    /**
     * Maximum number of items to display
     */
    maxItems?: number;

    /**
     * Whether the list is loading
     */
    isLoading?: boolean;
}

/**
 * ExecutionHistoryList component displays a list of loop execution history
 * 
 * @example
 * ```tsx
 * <ExecutionHistoryList
 *   history={executionHistory}
 *   onItemPress={handleHistoryItemPress}
 *   showDetails={true}
 *   maxItems={10}
 * />
 * ```
 */
export const ExecutionHistoryList: React.FC<ExecutionHistoryListProps> = ({
    history,
    onItemPress,
    showDetails = false,
    maxItems,
    isLoading = false,
    style,
}) => {
    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
        },
        listContainer: {
            padding: theme.spacing.s,
        },
        historyItem: {
            marginBottom: theme.spacing.s,
        },
        historyCard: {
            padding: theme.spacing.m,
        },
        historyHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.s,
        },
        historyTitle: {
            flex: 1,
            marginRight: theme.spacing.s,
        },
        historyDate: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        historyMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.m,
            marginBottom: showDetails ? theme.spacing.s : 0,
        },
        metaItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
        },
        metaIcon: {
            opacity: 0.7,
        },
        metaText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        statusBadge: {
            alignSelf: 'flex-start',
        },
        detailsContainer: {
            marginTop: theme.spacing.s,
            paddingTop: theme.spacing.s,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        detailLabel: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        detailValue: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.fontWeight.medium,
        },
        emptyState: {
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        emptyIcon: {
            marginBottom: theme.spacing.m,
        },
        emptyText: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        loadingContainer: {
            padding: theme.spacing.xl,
            alignItems: 'center',
        },
        loadingText: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.s,
        },
    }));

    const formatDate = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    };

    const getStatusColor = (status: ExecutionHistory['status']): string => {
        switch (status) {
            case 'completed':
                return styles.container.backgroundColor || '#4CAF50'; // Success green
            case 'paused':
                return '#FF9800'; // Warning orange
            case 'stopped':
                return '#F44336'; // Error red
            case 'skipped':
                return '#9E9E9E'; // Gray
            default:
                return styles.metaText.color;
        }
    };

    const getStatusIcon = (status: ExecutionHistory['status']): string => {
        switch (status) {
            case 'completed':
                return 'check-circle';
            case 'paused':
                return 'pause-circle';
            case 'stopped':
                return 'x-circle';
            case 'skipped':
                return 'skip-forward';
            default:
                return 'circle';
        }
    };

    const getCompletionPercentage = (item: ExecutionHistory): number => {
        if (item.totalActivities === 0) return 0;
        return Math.round((item.completedActivities / item.totalActivities) * 100);
    };

    const renderHistoryItem = ({ item }: { item: ExecutionHistory }) => (
        <View style={styles.historyItem}>
            <Card
                style={styles.historyCard}
                onPress={onItemPress ? () => onItemPress(item) : undefined}
                pressable={!!onItemPress}
            >
                {/* Header */}
                <View style={styles.historyHeader}>
                    <Typography variant="h4" style={styles.historyTitle}>
                        {item.loopTitle}
                    </Typography>
                    <Typography style={styles.historyDate}>
                        {formatDate(item.startedAt)}
                    </Typography>
                </View>

                {/* Meta Information */}
                <View style={styles.historyMeta}>
                    <View style={styles.metaItem}>
                        <Icon
                            name="clock"
                            size={14}
                            color={styles.metaText.color}
                            style={styles.metaIcon}
                        />
                        <Typography style={styles.metaText}>
                            {formatDuration(item.duration)}
                        </Typography>
                    </View>

                    <View style={styles.metaItem}>
                        <Icon
                            name="list"
                            size={14}
                            color={styles.metaText.color}
                            style={styles.metaIcon}
                        />
                        <Typography style={styles.metaText}>
                            {item.completedActivities}/{item.totalActivities} activities
                        </Typography>
                    </View>

                    <Badge
                        label={item.status}
                        variant="outline"
                        color={getStatusColor(item.status)}
                        leftIcon={getStatusIcon(item.status)}
                        style={styles.statusBadge}
                    />
                </View>

                {/* Detailed Information */}
                {showDetails && (
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Typography style={styles.detailLabel}>Completion:</Typography>
                            <Typography style={styles.detailValue}>
                                {getCompletionPercentage(item)}%
                            </Typography>
                        </View>

                        {item.iterationsCompleted !== undefined && (
                            <View style={styles.detailRow}>
                                <Typography style={styles.detailLabel}>Iterations:</Typography>
                                <Typography style={styles.detailValue}>
                                    {item.iterationsCompleted}
                                </Typography>
                            </View>
                        )}

                        {item.pausedCount !== undefined && item.pausedCount > 0 && (
                            <View style={styles.detailRow}>
                                <Typography style={styles.detailLabel}>Paused:</Typography>
                                <Typography style={styles.detailValue}>
                                    {item.pausedCount} times
                                </Typography>
                            </View>
                        )}

                        {item.skippedActivities !== undefined && item.skippedActivities > 0 && (
                            <View style={styles.detailRow}>
                                <Typography style={styles.detailLabel}>Skipped:</Typography>
                                <Typography style={styles.detailValue}>
                                    {item.skippedActivities} activities
                                </Typography>
                            </View>
                        )}

                        {item.endedAt && (
                            <View style={styles.detailRow}>
                                <Typography style={styles.detailLabel}>Ended:</Typography>
                                <Typography style={styles.detailValue}>
                                    {formatDate(item.endedAt)}
                                </Typography>
                            </View>
                        )}
                    </View>
                )}
            </Card>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon
                name="clock"
                size={48}
                color={styles.emptyText.color}
                style={styles.emptyIcon}
            />
            <Typography style={styles.emptyText}>
                No execution history yet
            </Typography>
        </View>
    );

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <Icon
                name="loader"
                size={24}
                color={styles.loadingText.color}
            />
            <Typography style={styles.loadingText}>
                Loading history...
            </Typography>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, style]}>
                {renderLoadingState()}
            </View>
        );
    }

    const displayHistory = maxItems ? history.slice(0, maxItems) : history;

    return (
        <View style={[styles.container, style]}>
            <FlatList
                data={displayHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyState}
            />
        </View>
    );
}; 