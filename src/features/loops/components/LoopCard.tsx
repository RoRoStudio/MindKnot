/**
 * LoopCard Component
 * Uses EntryCard.tsx as foundation with loop-specific features
 * 
 * Features:
 * - Loop title and description
 * - Activity count and duration estimate
 * - Category pill
 * - Tags display
 * - Last executed date
 * - Active session indicator
 * - Scheduled indicator
 * - Quick execution controls
 */

import React from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { EntryCard } from '../../../shared/components';
import { Loop, ActivityTemplate } from '../../../shared/types/loop';
import { ENTRY_TYPES, EntryType } from '../../../shared/constants/entryTypes';

export interface LoopCardProps {
    /** Loop data */
    loop: Loop;

    /** Activity templates for reference */
    templates: ActivityTemplate[];

    /** Whether to display in grid view */
    isGridView?: boolean;

    /** Whether the loop has an active session */
    hasActiveSession?: boolean;

    /** Whether the loop is scheduled */
    isScheduled?: boolean;

    /** Last execution date */
    lastExecuted?: Date;

    /** Callback when card is pressed */
    onPress?: () => void;

    /** Callback when execute button is pressed */
    onExecute?: () => void;

    /** Callback when edit button is pressed */
    onEdit?: () => void;

    /** Callback when duplicate button is pressed */
    onDuplicate?: () => void;

    /** Callback when delete button is pressed */
    onDelete?: () => void;
}

/**
 * LoopCard component for displaying loop information using EntryCard foundation
 */
export const LoopCard: React.FC<LoopCardProps> = ({
    loop,
    templates,
    isGridView = false,
    hasActiveSession = false,
    isScheduled = false,
    lastExecuted,
    onPress,
    onExecute,
    onEdit,
    onDuplicate,
    onDelete,
}) => {
    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
    }));

    // Calculate total estimated duration
    const estimatedDuration = React.useMemo(() => {
        return loop.activities.reduce((total, activity) => {
            return total + (activity.duration || 0);
        }, 0);
    }, [loop.activities]);

    // Get activity emojis for preview
    const activityEmojis = React.useMemo(() => {
        return loop.activities.slice(0, 5).map(activity => {
            const template = templates.find(t => t.id === activity.templateId);
            return template?.emoji || '⚡';
        });
    }, [loop.activities, templates]);

    // Format duration
    const formatDuration = (minutes: number): string => {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    // Format last executed date
    const formatLastExecuted = (date: Date): string => {
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    // Build subtitle with activity count and duration
    const subtitle = React.useMemo(() => {
        const parts = [`${loop.activities.length} activities`];
        if (estimatedDuration > 0) {
            parts.push(formatDuration(estimatedDuration));
        }
        if (hasActiveSession) {
            parts.push('ACTIVE SESSION');
        }
        if (isScheduled) {
            parts.push('SCHEDULED');
        }
        return parts.join(' • ');
    }, [loop.activities.length, estimatedDuration, hasActiveSession, isScheduled]);

    // Build description with activity preview
    const enhancedDescription = React.useMemo(() => {
        let desc = loop.description || '';

        if (activityEmojis.length > 0) {
            const emojiPreview = activityEmojis.join(' ') +
                (loop.activities.length > 5 ? ` +${loop.activities.length - 5}` : '');
            desc += desc ? `\n\n${emojiPreview}` : emojiPreview;
        }

        if (lastExecuted) {
            desc += desc ? `\n\nLast executed ${formatLastExecuted(lastExecuted)}` :
                `Last executed ${formatLastExecuted(lastExecuted)}`;
        }

        return desc;
    }, [loop.description, activityEmojis, loop.activities.length, lastExecuted]);

    return (
        <View style={styles.container}>
            <EntryCard
                id={loop.id}
                title={loop.title}
                description={enhancedDescription}
                iconName={ENTRY_TYPES[EntryType.LOOP].icon}
                borderColor={ENTRY_TYPES[EntryType.LOOP].color}
                createdAt={loop.createdAt.toISOString()}
                tags={loop.tags}
                categoryId={loop.categoryId}
                onPress={onPress}
                entryType="loop"
                subtitle={subtitle}
                showCreatedDate={false}
                // Pass through callbacks
                onDuplicate={onDuplicate ? () => onDuplicate() : undefined}
                onDelete={onDelete ? () => onDelete() : undefined}
                // Custom navigation handling
                navigationScreen={undefined} // We handle navigation via onPress
            />
        </View>
    );
}; 