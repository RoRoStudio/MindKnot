/**
 * ActivityCard Component
 * 
 * Displays an individual activity with its details, type icon, and action buttons.
 * Used in activity lists and execution screens.
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
import { Activity, ActivityType } from '../../../shared/types/loop';
import { formatDuration } from '../../../shared/utils/dateUtils';

export interface ActivityCardProps {
    /** The activity to display */
    activity: Activity;
    /** Index in the list (for numbering) */
    index?: number;
    /** Whether this activity is currently active */
    isActive?: boolean;
    /** Called when edit button is pressed */
    onEdit?: () => void;
    /** Called when remove button is pressed */
    onRemove?: () => void;
    /** Whether to show reorder controls */
    showReorderControls?: boolean;
    /** Custom style for the card */
    style?: any;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
    activity,
    index,
    isActive = false,
    onEdit,
    onRemove,
    showReorderControls = false,
    style,
}) => {
    const styles = useThemedStyles((theme) => ({
        card: {
            borderWidth: isActive ? 2 : 0,
            borderColor: isActive ? theme.colors.primary : 'transparent',
            backgroundColor: isActive ? theme.colors.primaryContainer : theme.colors.surface,
        },
        cardContent: {
            padding: theme.spacing.m,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        indexBadge: {
            marginRight: theme.spacing.s,
        },
        typeIcon: {
            width: 40,
            height: 40,
            borderRadius: theme.shape.radius.s,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.m,
        },
        titleContainer: {
            flex: 1,
        },
        title: {
            marginBottom: theme.spacing.xs,
        },
        description: {
            marginBottom: theme.spacing.s,
        },
        metadata: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.m,
        },
        metadataItem: {
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: theme.spacing.m,
        },
        metadataIcon: {
            marginRight: theme.spacing.xs,
        },
        metadataText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: theme.spacing.s,
        },
        iconButton: {
            width: 36,
            height: 36,
            borderRadius: theme.shape.radius.s,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
        },
        activeCard: {
            backgroundColor: theme.colors.primaryContainer,
        },
        activeText: {
            color: theme.colors.onPrimaryContainer,
        },
    }));

    const getActivityTypeIcon = (type: ActivityType): string => {
        switch (type) {
            case 'timer':
                return 'clock';
            case 'task':
                return 'check-square';
            case 'break':
                return 'coffee';
            case 'reflection':
                return 'book-open';
            case 'movement':
                return 'activity';
            case 'breathing':
                return 'wind';
            case 'custom':
                return 'settings';
            default:
                return 'circle';
        }
    };

    const getActivityTypeColor = (type: ActivityType): string => {
        const theme = styles.typeIcon;
        switch (type) {
            case 'timer':
                return '#3B82F6'; // blue
            case 'task':
                return '#10B981'; // green
            case 'break':
                return '#F59E0B'; // amber
            case 'reflection':
                return '#8B5CF6'; // purple
            case 'movement':
                return '#EF4444'; // red
            case 'breathing':
                return '#06B6D4'; // cyan
            case 'custom':
                return '#6B7280'; // gray
            default:
                return '#6B7280';
        }
    };

    const getActivityTypeLabel = (type: ActivityType): string => {
        switch (type) {
            case 'timer':
                return 'Timer';
            case 'task':
                return 'Task';
            case 'break':
                return 'Break';
            case 'reflection':
                return 'Reflection';
            case 'movement':
                return 'Movement';
            case 'breathing':
                return 'Breathing';
            case 'custom':
                return 'Custom';
            default:
                return 'Activity';
        }
    };

    const renderTypeIcon = () => {
        const iconName = getActivityTypeIcon(activity.type);
        const iconColor = getActivityTypeColor(activity.type);

        return (
            <View style={[styles.typeIcon, { backgroundColor: iconColor + '20' }]}>
                <Icon name={iconName} size={20} color={iconColor} />
            </View>
        );
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
                    {formatDuration(activity.duration)}
                </Typography>
            </View>

            <View style={styles.metadataItem}>
                <Icon
                    name="tag"
                    size={14}
                    color={styles.metadataText.color}
                    style={styles.metadataIcon}
                />
                <Typography style={styles.metadataText}>
                    {getActivityTypeLabel(activity.type)}
                </Typography>
            </View>
        </View>
    );

    const renderActions = () => {
        if (!onEdit && !onRemove && !showReorderControls) return null;

        return (
            <View style={styles.actions}>
                {showReorderControls && (
                    <TouchableOpacity style={styles.iconButton}>
                        <Icon name="menu" size={16} color={styles.metadataText.color} />
                    </TouchableOpacity>
                )}

                {onEdit && (
                    <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
                        <Icon name="edit" size={16} color={styles.metadataText.color} />
                    </TouchableOpacity>
                )}

                {onRemove && (
                    <TouchableOpacity style={styles.iconButton} onPress={onRemove}>
                        <Icon name="trash-2" size={16} color={styles.metadataText.color} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <Card style={[styles.card, style]}>
            <View style={styles.cardContent}>
                <View style={styles.header}>
                    {typeof index === 'number' && (
                        <Badge
                            variant="secondary"
                            label={`${index + 1}`}
                            style={styles.indexBadge}
                            size="small"
                        />
                    )}

                    {renderTypeIcon()}

                    <View style={styles.titleContainer}>
                        <Typography
                            variant="h5"
                            style={[styles.title, isActive && styles.activeText]}
                        >
                            {activity.title}
                        </Typography>

                        {activity.description && (
                            <Typography
                                variant="body2"
                                color="secondary"
                                style={[styles.description, isActive && styles.activeText]}
                                numberOfLines={2}
                            >
                                {activity.description}
                            </Typography>
                        )}
                    </View>

                    {renderActions()}
                </View>

                {renderMetadata()}
            </View>
        </Card>
    );
}; 