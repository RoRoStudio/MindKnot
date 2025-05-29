/**
 * LoopPreviewCard Component
 * Shows a preview of the loop with activities and estimated duration
 * Used in Step 3 of the loop builder
 */

import React from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Card,
} from '../../../shared/components';
import { ActivityInstance, ActivityTemplate } from '../../../shared/types/loop';

export interface LoopPreviewCardProps {
    /** Loop title */
    title: string;

    /** Loop description */
    description?: string;

    /** Activity instances */
    activities: ActivityInstance[];

    /** Template references */
    templates: ActivityTemplate[];
}

/**
 * LoopPreviewCard component for showing loop preview
 */
export const LoopPreviewCard: React.FC<LoopPreviewCardProps> = ({
    title,
    description,
    activities,
    templates,
}) => {
    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.l,
        },
        header: {
            marginBottom: theme.spacing.m,
        },
        title: {
            fontSize: theme.typography.fontSize.l,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xs,
        },
        description: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            lineHeight: 20,
        },
        stats: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.s,
        },
        statItem: {
            alignItems: 'center',
        },
        statValue: {
            fontSize: theme.typography.fontSize.l,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.primary,
        },
        statLabel: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
        },
        activitiesSection: {
            marginTop: theme.spacing.m,
        },
        sectionTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.s,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.s,
            marginBottom: theme.spacing.xs,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        activityEmoji: {
            fontSize: 20,
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
        emptyState: {
            alignItems: 'center',
            padding: theme.spacing.l,
        },
        emptyText: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
    }));

    // Calculate total estimated duration
    const totalDuration = activities.reduce((total, activity) => {
        return total + (activity.duration || 0);
    }, 0);

    // Get activity count
    const activityCount = activities.length;

    // Format duration
    const formatDuration = (minutes: number) => {
        if (minutes === 0) return 'No duration set';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    return (
        <Card style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Typography style={styles.title}>
                    {title || 'Untitled Loop'}
                </Typography>
                {description && (
                    <Typography style={styles.description}>
                        {description}
                    </Typography>
                )}
            </View>

            {/* Stats */}
            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Typography style={styles.statValue}>
                        {activityCount}
                    </Typography>
                    <Typography style={styles.statLabel}>
                        {activityCount === 1 ? 'Activity' : 'Activities'}
                    </Typography>
                </View>

                <View style={styles.statItem}>
                    <Typography style={styles.statValue}>
                        {totalDuration > 0 ? formatDuration(totalDuration) : '~'}
                    </Typography>
                    <Typography style={styles.statLabel}>
                        Est. Duration
                    </Typography>
                </View>
            </View>

            {/* Activities */}
            {activities.length > 0 ? (
                <View style={styles.activitiesSection}>
                    <Typography style={styles.sectionTitle}>
                        Activities Preview
                    </Typography>

                    {activities.map((activity, index) => {
                        const template = templates.find(t => t.id === activity.templateId);
                        const displayTitle = activity.title || template?.title || 'Untitled Activity';

                        // Build meta information
                        const metaParts = [];
                        if (activity.duration) {
                            metaParts.push(`${activity.duration} min`);
                        }
                        if (activity.quantity) {
                            metaParts.push(`${activity.quantity.number} ${activity.quantity.unit}`);
                        }
                        if (activity.subItems && activity.subItems.length > 0) {
                            metaParts.push(`${activity.subItems.length} sub-items`);
                        }

                        return (
                            <View key={`${activity.id}-${index}`} style={styles.activityItem}>
                                <Typography style={styles.activityEmoji}>
                                    {template?.emoji || '⚡'}
                                </Typography>
                                <View style={styles.activityContent}>
                                    <Typography style={styles.activityTitle}>
                                        {index + 1}. {displayTitle}
                                    </Typography>
                                    {metaParts.length > 0 && (
                                        <Typography style={styles.activityMeta}>
                                            {metaParts.join(' • ')}
                                        </Typography>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <Typography style={styles.emptyText}>
                        No activities added yet
                    </Typography>
                </View>
            )}
        </Card>
    );
}; 