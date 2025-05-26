import React from 'react';
import { View, ScrollView } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Typography, Button, Card, Icon } from '../../../shared/components';
import { StyleProps } from '../../../shared/components/shared-props';
import { Loop, Activity } from '../../../shared/types/loop';

export interface LoopPreviewProps extends StyleProps {
    /**
     * Loop to preview
     */
    loop: Loop;

    /**
     * Callback to start loop execution
     */
    onStartExecution?: () => void;

    /**
     * Callback to edit the loop
     */
    onEdit?: () => void;

    /**
     * Whether execution controls should be shown
     */
    showExecutionControls?: boolean;

    /**
     * Whether edit controls should be shown
     */
    showEditControls?: boolean;
}

/**
 * LoopPreview component displays a comprehensive preview of a loop
 * 
 * @example
 * ```tsx
 * <LoopPreview
 *   loop={currentLoop}
 *   onStartExecution={handleStartExecution}
 *   onEdit={handleEdit}
 *   showExecutionControls={true}
 * />
 * ```
 */
export const LoopPreview: React.FC<LoopPreviewProps> = ({
    loop,
    onStartExecution,
    onEdit,
    showExecutionControls = false,
    showEditControls = false,
    style,
}) => {
    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            padding: theme.spacing.m,
        },
        scrollContainer: {
            flex: 1,
        },
        header: {
            marginBottom: theme.spacing.l,
        },
        title: {
            marginBottom: theme.spacing.s,
        },
        description: {
            marginBottom: theme.spacing.m,
        },
        metadataRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        metadataIcon: {
            marginRight: theme.spacing.s,
        },
        metadataText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            marginBottom: theme.spacing.s,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.s,
            marginBottom: theme.spacing.s,
        },
        activityIndex: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.m,
        },
        activityIndexText: {
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.surface,
        },
        activityContent: {
            flex: 1,
        },
        activityTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xs,
        },
        activityMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.m,
        },
        activityDuration: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        activityType: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.primary,
            fontWeight: theme.typography.fontWeight.medium,
        },
        optionalBadge: {
            backgroundColor: theme.colors.warning,
            paddingHorizontal: theme.spacing.xs,
            paddingVertical: theme.spacing.xxs,
            borderRadius: theme.shape.radius.xs,
        },
        optionalText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.surface,
            fontWeight: theme.typography.fontWeight.medium,
        },
        summaryCard: {
            backgroundColor: theme.colors.primary + '10',
            borderColor: theme.colors.primary,
            borderWidth: 1,
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        summaryLabel: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        summaryValue: {
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
        },
        tagContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.xs,
            marginTop: theme.spacing.s,
        },
        tag: {
            backgroundColor: theme.colors.secondary + '20',
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
        },
        tagText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.secondary,
            fontWeight: theme.typography.fontWeight.medium,
        },
        actionButtons: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            paddingTop: theme.spacing.m,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        actionButton: {
            flex: 1,
        },
        emptyState: {
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        emptyText: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: theme.spacing.s,
        },
    }));

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0 && remainingSeconds > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${remainingSeconds}s`;
        }
    };

    const getTotalDuration = (): number => {
        return loop.activities.reduce((total, activity) => total + activity.duration, 0);
    };

    const getActivityTypeIcon = (type: string): string => {
        const iconMap: Record<string, string> = {
            focus: 'target',
            break: 'coffee',
            exercise: 'activity',
            meditation: 'heart',
            reading: 'book-open',
            custom: 'settings',
        };
        return iconMap[type] || 'circle';
    };

    const renderActivityList = () => {
        if (loop.activities.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Icon name="list" size={48} color={styles.emptyText.color} />
                    <Typography style={styles.emptyText}>
                        No activities added yet
                    </Typography>
                </View>
            );
        }

        return loop.activities.map((activity: Activity, index: number) => (
            <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIndex}>
                    <Typography style={styles.activityIndexText}>
                        {index + 1}
                    </Typography>
                </View>

                <View style={styles.activityContent}>
                    <Typography style={styles.activityTitle}>
                        {activity.title}
                    </Typography>

                    <View style={styles.activityMeta}>
                        <Typography style={styles.activityDuration}>
                            {formatDuration(activity.duration)}
                        </Typography>

                        <Typography style={styles.activityType}>
                            {activity.type}
                        </Typography>

                        {activity.isOptional && (
                            <View style={styles.optionalBadge}>
                                <Typography style={styles.optionalText}>
                                    Optional
                                </Typography>
                            </View>
                        )}
                    </View>
                </View>

                <Icon
                    name={getActivityTypeIcon(activity.type)}
                    size={20}
                    color={styles.activityType.color}
                />
            </View>
        ));
    };

    const renderSummary = () => (
        <Card style={[styles.section, styles.summaryCard]}>
            <Typography variant="h4" style={styles.sectionTitle}>
                Loop Summary
            </Typography>

            <View style={styles.summaryRow}>
                <Typography style={styles.summaryLabel}>Total Activities:</Typography>
                <Typography style={styles.summaryValue}>
                    {loop.activities.length}
                </Typography>
            </View>

            <View style={styles.summaryRow}>
                <Typography style={styles.summaryLabel}>Total Duration:</Typography>
                <Typography style={styles.summaryValue}>
                    {formatDuration(getTotalDuration())}
                </Typography>
            </View>

            <View style={styles.summaryRow}>
                <Typography style={styles.summaryLabel}>Optional Activities:</Typography>
                <Typography style={styles.summaryValue}>
                    {loop.activities.filter(a => a.isOptional).length}
                </Typography>
            </View>

            {loop.isRepeatable && (
                <>
                    <View style={styles.summaryRow}>
                        <Typography style={styles.summaryLabel}>Max Iterations:</Typography>
                        <Typography style={styles.summaryValue}>
                            {loop.maxIterations || 1}
                        </Typography>
                    </View>

                    {loop.breakBetweenIterations && loop.breakBetweenIterations > 0 && (
                        <View style={styles.summaryRow}>
                            <Typography style={styles.summaryLabel}>Break Between:</Typography>
                            <Typography style={styles.summaryValue}>
                                {formatDuration(loop.breakBetweenIterations)}
                            </Typography>
                        </View>
                    )}
                </>
            )}
        </Card>
    );

    return (
        <View style={[styles.container, style]}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Typography variant="h2" style={styles.title}>
                        {loop.title}
                    </Typography>

                    {loop.description && (
                        <Typography variant="body1" style={styles.description}>
                            {loop.description}
                        </Typography>
                    )}

                    {/* Metadata */}
                    {loop.category && (
                        <View style={styles.metadataRow}>
                            <Icon name="folder" size={16} color={styles.metadataText.color} style={styles.metadataIcon} />
                            <Typography style={styles.metadataText}>
                                Category: {loop.category}
                            </Typography>
                        </View>
                    )}

                    <View style={styles.metadataRow}>
                        <Icon name="clock" size={16} color={styles.metadataText.color} style={styles.metadataIcon} />
                        <Typography style={styles.metadataText}>
                            Created: {new Date(loop.createdAt).toLocaleDateString()}
                        </Typography>
                    </View>

                    {loop.tags && loop.tags.length > 0 && (
                        <View style={styles.tagContainer}>
                            {loop.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Typography style={styles.tagText}>
                                        {tag}
                                    </Typography>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Summary */}
                {renderSummary()}

                {/* Activities */}
                <Card style={styles.section}>
                    <Typography variant="h4" style={styles.sectionTitle}>
                        Activities ({loop.activities.length})
                    </Typography>

                    {renderActivityList()}
                </Card>
            </ScrollView>

            {/* Action Buttons */}
            {(showExecutionControls || showEditControls) && (
                <View style={styles.actionButtons}>
                    {showEditControls && (
                        <Button
                            variant="secondary"
                            label="Edit Loop"
                            leftIcon="edit"
                            onPress={onEdit}
                            style={styles.actionButton}
                        />
                    )}

                    {showExecutionControls && (
                        <Button
                            variant="primary"
                            label="Start Execution"
                            leftIcon="play"
                            onPress={onStartExecution}
                            disabled={loop.activities.length === 0}
                            style={styles.actionButton}
                        />
                    )}
                </View>
            )}
        </View>
    );
}; 