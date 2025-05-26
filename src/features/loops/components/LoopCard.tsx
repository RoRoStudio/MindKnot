/**
 * LoopCard Component
 * 
 * Displays a loop in a card format with actions.
 * Used in loop lists and selection interfaces.
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Button,
    Card,
    Icon,
    Badge
} from '../../../shared/components';
import { Loop } from '../../../shared/types/loop';
import { formatDuration, formatRelativeTime } from '../../../shared/utils/dateUtils';

export interface LoopCardProps {
    /** The loop to display */
    loop: Loop;
    /** Called when the card is pressed */
    onPress?: () => void;
    /** Called when edit button is pressed */
    onEdit?: () => void;
    /** Called when delete button is pressed */
    onDelete?: () => void;
    /** Called when start button is pressed */
    onStart?: () => void;
    /** Whether to show the execution button */
    showExecutionButton?: boolean;
    /** Whether the card is in selection mode */
    isSelected?: boolean;
    /** Custom style for the card */
    style?: any;
}

export const LoopCard: React.FC<LoopCardProps> = ({
    loop,
    onPress,
    onEdit,
    onDelete,
    onStart,
    showExecutionButton = true,
    isSelected = false,
    style,
}) => {
    const styles = useThemedStyles((theme) => ({
        card: {
            marginBottom: theme.spacing.m,
            borderWidth: isSelected ? 2 : 0,
            borderColor: isSelected ? theme.colors.primary : 'transparent',
        },
        cardContent: {
            padding: theme.spacing.m,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.s,
        },
        titleContainer: {
            flex: 1,
            marginRight: theme.spacing.m,
        },
        title: {
            marginBottom: theme.spacing.xs,
        },
        description: {
            marginBottom: theme.spacing.s,
        },
        metadata: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: theme.spacing.m,
        },
        metadataItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: theme.spacing.m,
            marginBottom: theme.spacing.xs,
        },
        metadataIcon: {
            marginRight: theme.spacing.xs,
        },
        metadataText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: theme.spacing.m,
        },
        tag: {
            marginRight: theme.spacing.s,
            marginBottom: theme.spacing.xs,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        primaryActions: {
            flexDirection: 'row',
            gap: theme.spacing.s,
        },
        secondaryActions: {
            flexDirection: 'row',
            gap: theme.spacing.xs,
        },
        actionButton: {
            minWidth: 80,
        },
        iconButton: {
            width: 40,
            height: 40,
            borderRadius: theme.shape.radius.s,
            justifyContent: 'center',
            alignItems: 'center',
        },
        statusBadge: {
            position: 'absolute',
            top: theme.spacing.s,
            right: theme.spacing.s,
        },
    }));

    const getStatusBadge = () => {
        if (loop.executionCount === 0) {
            return <Badge variant="info" label="New" style={styles.statusBadge} />;
        }

        if (loop.lastExecutedAt) {
            const daysSinceExecution = Math.floor(
                (Date.now() - new Date(loop.lastExecutedAt).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceExecution === 0) {
                return <Badge variant="success" label="Today" style={styles.statusBadge} />;
            } else if (daysSinceExecution <= 7) {
                return <Badge variant="warning" label="Recent" style={styles.statusBadge} />;
            }
        }

        return null;
    };

    const renderMetadata = () => (
        <View style={styles.metadata}>
            <View style={styles.metadataItem}>
                <Icon
                    name="clock"
                    size={14}
                    color={styles.metadataText.color}
                    style={styles.metadataIcon}
                />
                <Typography style={styles.metadataText}>
                    {formatDuration(loop.estimatedDuration)}
                </Typography>
            </View>

            <View style={styles.metadataItem}>
                <Icon
                    name="activity"
                    size={14}
                    color={styles.metadataText.color}
                    style={styles.metadataIcon}
                />
                <Typography style={styles.metadataText}>
                    {loop.activities.length} activities
                </Typography>
            </View>

            {loop.isRepeating && (
                <View style={styles.metadataItem}>
                    <Icon
                        name="repeat"
                        size={14}
                        color={styles.metadataText.color}
                        style={styles.metadataIcon}
                    />
                    <Typography style={styles.metadataText}>
                        {loop.repeatCycles ? `${loop.repeatCycles} cycles` : 'Infinite'}
                    </Typography>
                </View>
            )}

            <View style={styles.metadataItem}>
                <Icon
                    name="play-circle"
                    size={14}
                    color={styles.metadataText.color}
                    style={styles.metadataIcon}
                />
                <Typography style={styles.metadataText}>
                    {loop.executionCount} runs
                </Typography>
            </View>

            {loop.lastExecutedAt && (
                <View style={styles.metadataItem}>
                    <Icon
                        name="calendar"
                        size={14}
                        color={styles.metadataText.color}
                        style={styles.metadataIcon}
                    />
                    <Typography style={styles.metadataText}>
                        {formatRelativeTime(loop.lastExecutedAt)}
                    </Typography>
                </View>
            )}
        </View>
    );

    const renderTags = () => {
        if (loop.tags.length === 0) return null;

        return (
            <View style={styles.tagsContainer}>
                {loop.tags.slice(0, 3).map((tag, index) => (
                    <Badge
                        key={index}
                        variant="secondary"
                        label={tag}
                        style={styles.tag}
                        size="small"
                    />
                ))}
                {loop.tags.length > 3 && (
                    <Badge
                        variant="secondary"
                        label={`+${loop.tags.length - 3}`}
                        style={styles.tag}
                        size="small"
                    />
                )}
            </View>
        );
    };

    const renderActions = () => (
        <View style={styles.actions}>
            <View style={styles.primaryActions}>
                {showExecutionButton && onStart && (
                    <Button
                        variant="primary"
                        label="Start"
                        leftIcon="play"
                        onPress={onStart}
                        style={styles.actionButton}
                        size="small"
                    />
                )}
            </View>

            <View style={styles.secondaryActions}>
                {onEdit && (
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: styles.card.backgroundColor }]}
                        onPress={onEdit}
                    >
                        <Icon name="edit" size={18} color={styles.metadataText.color} />
                    </TouchableOpacity>
                )}

                {onDelete && (
                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: styles.card.backgroundColor }]}
                        onPress={onDelete}
                    >
                        <Icon name="trash-2" size={18} color={styles.metadataText.color} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <Card
            style={[styles.card, style]}
            onPress={onPress}
        >
            {getStatusBadge()}

            <View style={styles.cardContent}>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Typography variant="h4" style={styles.title}>
                            {loop.title}
                        </Typography>

                        {loop.description && (
                            <Typography
                                variant="body2"
                                color="secondary"
                                style={styles.description}
                                numberOfLines={2}
                            >
                                {loop.description}
                            </Typography>
                        )}
                    </View>
                </View>

                {renderMetadata()}
                {renderTags()}
                {renderActions()}
            </View>
        </Card>
    );
}; 