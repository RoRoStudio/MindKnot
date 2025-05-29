import React from 'react';
import { View, ScrollView } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Typography, Card, Icon } from '../../../shared/components';
import { IconName } from '../../../shared/components/Icon';
import { StyleProps } from '../../../shared/components/shared-props';
import { Loop, ExecutionHistory } from '../../../shared/types/loop';

export interface LoopStatsData {
    totalExecutions: number;
    completedExecutions: number;
    totalTimeSpent: number;
    averageExecutionTime: number;
    completionRate: number;
    streakDays: number;
    lastExecuted?: Date;
    favoriteTimeOfDay?: string;
    mostSkippedActivity?: string;
    averageActivitiesCompleted: number;
}

export interface LoopStatsProps extends StyleProps {
    /**
     * Loop to display stats for
     */
    loop: Loop;

    /**
     * Execution history for calculating stats
     */
    executionHistory: ExecutionHistory[];

    /**
     * Whether to show detailed statistics
     */
    showDetails?: boolean;

    /**
     * Time period for stats calculation
     */
    timePeriod?: 'week' | 'month' | 'year' | 'all';
}

/**
 * LoopStats component displays statistics and analytics for a loop
 * 
 * @example
 * ```tsx
 * <LoopStats
 *   loop={currentLoop}
 *   executionHistory={history}
 *   showDetails={true}
 *   timePeriod="month"
 * />
 * ```
 */
export const LoopStats: React.FC<LoopStatsProps> = ({
    loop,
    executionHistory,
    showDetails = false,
    timePeriod = 'all',
    style,
}) => {
    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
        },
        scrollContainer: {
            padding: theme.spacing.m,
        },
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.m,
            marginBottom: theme.spacing.l,
        },
        statCard: {
            flex: 1,
            minWidth: '45%',
            padding: theme.spacing.m,
            alignItems: 'center',
        },
        statIcon: {
            marginBottom: theme.spacing.s,
        },
        statValue: {
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.primary,
            marginBottom: theme.spacing.xs,
        },
        statLabel: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        detailsSection: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            marginBottom: theme.spacing.m,
        },
        detailCard: {
            padding: theme.spacing.m,
            marginBottom: theme.spacing.s,
        },
        detailRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        detailLabel: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
            flex: 1,
        },
        detailValue: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.primary,
        },
        progressBar: {
            height: 8,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 4,
            marginTop: theme.spacing.xs,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.primary,
            borderRadius: 4,
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
        trendIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing.xs,
        },
        trendIcon: {
            marginRight: theme.spacing.xs,
        },
        trendText: {
            fontSize: theme.typography.fontSize.s,
        },
        trendPositive: {
            color: theme.colors.success,
        },
        trendNegative: {
            color: theme.colors.error,
        },
        trendNeutral: {
            color: theme.colors.textSecondary,
        },
        progressContainer: {
            flex: 1,
            marginLeft: theme.spacing.m,
        },
    }));

    const calculateStats = (): LoopStatsData => {
        const now = new Date();
        let filteredHistory = executionHistory;

        // Filter by time period
        if (timePeriod !== 'all') {
            const cutoffDate = new Date();
            switch (timePeriod) {
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
            }
            filteredHistory = executionHistory.filter(h => new Date(h.startedAt) >= cutoffDate);
        }

        const totalExecutions = filteredHistory.length;
        const completedExecutions = filteredHistory.filter(h => h.status === 'completed').length;
        const totalTimeSpent = filteredHistory.reduce((sum, h) => sum + h.duration, 0);
        const averageExecutionTime = totalExecutions > 0 ? totalTimeSpent / totalExecutions : 0;
        const completionRate = totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 0;

        // Calculate streak
        const sortedHistory = [...filteredHistory].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
        let streakDays = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const execution of sortedHistory) {
            const executionDate = new Date(execution.startedAt);
            executionDate.setHours(0, 0, 0, 0);

            if (executionDate.getTime() === currentDate.getTime()) {
                streakDays++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (executionDate.getTime() < currentDate.getTime()) {
                break;
            }
        }

        // Find favorite time of day
        const hourCounts: Record<number, number> = {};
        filteredHistory.forEach(h => {
            const hour = new Date(h.startedAt).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const favoriteHour = Object.entries(hourCounts).reduce((max, [hour, count]) =>
            count > max.count ? { hour: parseInt(hour), count } : max,
            { hour: 0, count: 0 }
        );

        const favoriteTimeOfDay = favoriteHour.count > 0 ? getTimeOfDayLabel(favoriteHour.hour) : undefined;

        // Calculate average activities completed
        const averageActivitiesCompleted = totalExecutions > 0
            ? filteredHistory.reduce((sum, h) => sum + h.activitiesCompleted, 0) / totalExecutions
            : 0;

        return {
            totalExecutions,
            completedExecutions,
            totalTimeSpent,
            averageExecutionTime,
            completionRate,
            streakDays,
            lastExecuted: sortedHistory[0] ? new Date(sortedHistory[0].startedAt) : undefined,
            favoriteTimeOfDay,
            averageActivitiesCompleted,
        };
    };

    const getTimeOfDayLabel = (hour: number): string => {
        if (hour < 6) return 'Early Morning';
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        if (hour < 21) return 'Evening';
        return 'Night';
    };

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${seconds}s`;
        }
    };

    const formatDate = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const stats = calculateStats();

    if (executionHistory.length === 0) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.emptyState}>
                    <Icon
                        name="bar-chart"
                        size={48}
                        color={styles.emptyText.color}
                        style={styles.emptyIcon}
                    />
                    <Typography style={styles.emptyText}>
                        No execution data available yet.{'\n'}
                        Start using this loop to see statistics.
                    </Typography>
                </View>
            </View>
        );
    }

    const renderStatCard = (
        icon: IconName,
        value: string | number,
        label: string,
        trend?: { direction: 'up' | 'down' | 'neutral'; value: string }
    ) => (
        <Card style={styles.statCard}>
            <Icon name={icon} size={24} color={styles.statValue.color} style={styles.statIcon} />
            <Typography style={styles.statValue}>
                {typeof value === 'number' ? Math.round(value) : value}
            </Typography>
            <Typography style={styles.statLabel}>
                {label}
            </Typography>
            {trend && (
                <View style={styles.trendIndicator}>
                    <Icon
                        name={trend.direction === 'up' ? 'trending-up' : trend.direction === 'down' ? 'trending-down' : 'minus'}
                        size={12}
                        color={trend.direction === 'up' ? styles.trendPositive.color :
                            trend.direction === 'down' ? styles.trendNegative.color :
                                styles.trendNeutral.color}
                        style={styles.trendIcon}
                    />
                    <Typography style={[
                        styles.trendText,
                        trend.direction === 'up' ? styles.trendPositive :
                            trend.direction === 'down' ? styles.trendNegative :
                                styles.trendNeutral
                    ]}>
                        {trend.value}
                    </Typography>
                </View>
            )}
        </Card>
    );

    return (
        <View style={[styles.container, style]}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Main Stats Grid */}
                <View style={styles.statsGrid}>
                    {renderStatCard('play', stats.totalExecutions, 'Total Executions')}
                    {renderStatCard('check-circle', stats.completedExecutions, 'Completed')}
                    {renderStatCard('clock', formatDuration(stats.totalTimeSpent), 'Total Time')}
                    {renderStatCard('percent', `${Math.round(stats.completionRate)}%`, 'Completion Rate')}
                </View>

                {/* Additional Stats */}
                <View style={styles.statsGrid}>
                    {renderStatCard('zap', stats.streakDays, 'Day Streak')}
                    {renderStatCard('activity', Math.round(stats.averageActivitiesCompleted), 'Avg Activities')}
                </View>

                {/* Detailed Information */}
                {showDetails && (
                    <View style={styles.detailsSection}>
                        <Typography variant="h3" style={styles.sectionTitle}>
                            Detailed Statistics
                        </Typography>

                        <Card style={styles.detailCard}>
                            <View style={styles.detailRow}>
                                <Typography style={styles.detailLabel}>Average Execution Time</Typography>
                                <Typography style={styles.detailValue}>
                                    {formatDuration(stats.averageExecutionTime)}
                                </Typography>
                            </View>

                            {stats.lastExecuted && (
                                <View style={styles.detailRow}>
                                    <Typography style={styles.detailLabel}>Last Executed</Typography>
                                    <Typography style={styles.detailValue}>
                                        {formatDate(stats.lastExecuted)}
                                    </Typography>
                                </View>
                            )}

                            {stats.favoriteTimeOfDay && (
                                <View style={styles.detailRow}>
                                    <Typography style={styles.detailLabel}>Favorite Time</Typography>
                                    <Typography style={styles.detailValue}>
                                        {stats.favoriteTimeOfDay}
                                    </Typography>
                                </View>
                            )}

                            <View style={styles.detailRow}>
                                <Typography style={styles.detailLabel}>Success Rate</Typography>
                                <View style={styles.progressContainer}>
                                    <Typography style={[styles.detailValue, { textAlign: 'right' }]}>
                                        {Math.round(stats.completionRate)}%
                                    </Typography>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${stats.completionRate}%` }
                                            ]}
                                        />
                                    </View>
                                </View>
                            </View>
                        </Card>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}; 