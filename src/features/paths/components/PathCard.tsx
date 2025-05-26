// src/components/entries/paths/PathCard.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Path } from '../../../shared/types/path';
import { EntryCard } from '../../../shared/components';
import { ENTRY_TYPES, EntryType } from '../../../shared/constants/entryTypes';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Typography, Icon } from '../../../shared/components';

interface PathCardProps {
    path: Path;
    onPress?: () => void;
    onEntryUpdated?: () => void;
    onToggleActionDone?: (id: string) => void;
}

export const PathCard: React.FC<PathCardProps> = ({
    path,
    onPress,
    onEntryUpdated,
    onToggleActionDone
}) => {
    const [expanded, setExpanded] = useState(false);

    // Create a subtitle with milestone count and dates
    let subtitle = '';
    if (path.milestones) {
        subtitle += `${path.milestones.length} milestone${path.milestones.length !== 1 ? 's' : ''}`;
    }
    if (path.startDate) {
        const formattedStartDate = new Date(path.startDate).toLocaleDateString();
        subtitle += subtitle ? ` • Started: ${formattedStartDate}` : `Started: ${formattedStartDate}`;
    }
    if (path.targetDate) {
        const formattedTargetDate = new Date(path.targetDate).toLocaleDateString();
        subtitle += subtitle ? ` • Target: ${formattedTargetDate}` : `Target: ${formattedTargetDate}`;
    }

    // Handle quick actions
    const handleToggleExpand = () => {
        setExpanded(!expanded);
    };

    const styles = useThemedStyles((theme) => ({
        milestone: {
            marginBottom: theme.spacing.m,
        },
        milestoneHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.s,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.s,
        },
        milestoneTitle: {
            flex: 1,
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
        },
        milestoneDate: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
        },
        action: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.s,
            marginVertical: theme.spacing.xs,
            marginLeft: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.s,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        actionCheckbox: {
            marginRight: theme.spacing.s,
            padding: theme.spacing.xs,
        },
        actionText: {
            flex: 1,
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textPrimary,
        },
        actionTextDone: {
            textDecorationLine: 'line-through',
            color: theme.colors.textSecondary,
        },
        actionMilestone: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.s,
        },
        pathContent: {
            marginTop: theme.spacing.s,
        },
    }));

    const renderAction = (action: any) => {
        return (
            <View key={action.id} style={styles.action}>
                <TouchableOpacity
                    style={styles.actionCheckbox}
                    onPress={() => {
                        if (onToggleActionDone) {
                            onToggleActionDone(action.id);
                        }
                    }}
                >
                    <Icon
                        name={action.done ? "square-check" : "square"}
                        size={18}
                        color={action.done ? styles.actionText.color : styles.actionTextDone.color}
                    />
                </TouchableOpacity>
                <Typography
                    style={[
                        styles.actionText,
                        action.done && styles.actionTextDone
                    ]}
                >
                    {action.title}
                </Typography>
                {action.milestone && (
                    <Typography style={styles.actionMilestone}>
                        {action.milestone}
                    </Typography>
                )}
            </View>
        );
    };

    const renderMilestone = (milestone: any) => {
        return (
            <View key={milestone.id} style={styles.milestone}>
                <View style={styles.milestoneHeader}>
                    <Typography style={styles.milestoneTitle}>
                        {milestone.title}
                    </Typography>
                    {milestone.date && (
                        <Typography style={styles.milestoneDate}>
                            {new Date(milestone.date).toLocaleDateString()}
                        </Typography>
                    )}
                </View>
                {milestone.actions && milestone.actions.map(renderAction)}
            </View>
        );
    };

    const renderPathContent = () => {
        if (!path.milestones || path.milestones.length === 0) {
            // No content to render without milestones
            return null;
        }

        // Render milestones
        return (
            <View style={styles.pathContent}>
                {path.milestones.map(renderMilestone)}
            </View>
        );
    };

    const hasMilestonesOrActions =
        (path.milestones && path.milestones.length > 0);

    return (
        <EntryCard
            id={path.id}
            title={path.title}
            subtitle={subtitle}
            description={path.description}
            iconName={ENTRY_TYPES[EntryType.PATH].icon}
            borderColor={ENTRY_TYPES[EntryType.PATH].color}
            createdAt={path.createdAt}
            tags={path.tags}
            categoryId={path.categoryId}
            onPress={onPress}
            isStarred={path.isStarred}
            entryType="path"
            onEntryUpdated={onEntryUpdated}
            // Paths can be expandable if they have milestones
            expandable={hasMilestonesOrActions}
            expanded={expanded}
            onToggleExpand={handleToggleExpand}
            expandedContent={renderPathContent()}
            navigationScreen="PathScreen"
        />
    );
};