/**
 * ActivityList Component
 * 
 * Displays a list of activities with optional editing and reordering capabilities.
 * Used in loop details and builder screens.
 */

import React from 'react';
import { View, FlatList } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Typography } from '../../../shared/components';
import { Activity } from '../../../shared/types/loop';
import { ActivityCard } from './ActivityCard';

export interface ActivityListProps {
    /** Array of activities to display */
    activities: Activity[];
    /** Called when an activity is edited */
    onEdit?: (activity: Activity) => void;
    /** Called when an activity is removed */
    onRemove?: (activityId: string) => void;
    /** Called when activities are reordered */
    onReorder?: (activities: Activity[]) => void;
    /** Whether to show reorder controls */
    showReorderControls?: boolean;
    /** Whether the list is in read-only mode */
    readOnly?: boolean;
    /** Custom style for the container */
    style?: any;
}

export const ActivityList: React.FC<ActivityListProps> = ({
    activities,
    onEdit,
    onRemove,
    onReorder,
    showReorderControls = false,
    readOnly = false,
    style,
}) => {
    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
        },
        emptyContainer: {
            padding: theme.spacing.l,
            alignItems: 'center',
        },
        emptyText: {
            textAlign: 'center',
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
        },
        activityItem: {
            marginBottom: theme.spacing.m,
        },
    }));

    const renderActivity = ({ item, index }: { item: Activity; index: number }) => (
        <ActivityCard
            activity={item}
            index={index}
            onEdit={!readOnly && onEdit ? () => onEdit(item) : undefined}
            onRemove={!readOnly && onRemove ? () => onRemove(item.id) : undefined}
            showReorderControls={showReorderControls && !readOnly}
            style={styles.activityItem}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Typography variant="body2" style={styles.emptyText}>
                No activities added yet
            </Typography>
        </View>
    );

    if (activities.length === 0) {
        return renderEmptyState();
    }

    return (
        <View style={[styles.container, style]}>
            <FlatList
                data={activities}
                renderItem={renderActivity}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false} // Disable scroll since this is usually inside a ScrollView
            />
        </View>
    );
}; 