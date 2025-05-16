// src/components/entries/PathCard.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Path } from '../../../types/path';
import { EntryCard } from '../EntryCard';
import { useTheme } from '../../../contexts/ThemeContext';
import { Typography, Icon } from '../../common';
import { TouchableOpacity } from 'react-native';

interface PathCardProps {
    path: Path;
    onPress?: () => void;
    onStar?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onArchive?: (id: string) => void;
    onHide?: (id: string) => void;
    onToggleActionDone?: (id: string) => void;
}

export const PathCard: React.FC<PathCardProps> = ({
    path,
    onPress,
    onStar,
    onDuplicate,
    onArchive,
    onHide,
    onToggleActionDone
}) => {
    const { theme } = useTheme();
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
    const handleStar = () => {
        if (onStar) onStar(path.id);
    };

    const handleDuplicate = () => {
        if (onDuplicate) onDuplicate(path.id);
    };

    const handleArchive = () => {
        if (onArchive) onArchive(path.id);
    };

    const handleHide = () => {
        if (onHide) onHide(path.id);
    };

    const handleToggleExpand = () => {
        setExpanded(!expanded);
    };

    const styles = StyleSheet.create({
        milestone: {
            marginBottom: 16,
        },
        milestoneHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.s,
        },
        milestoneTitle: {
            flex: 1,
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
        },
        milestoneDate: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        action: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            marginVertical: 4,
            marginLeft: 16,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.s,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        actionCheckbox: {
            marginRight: 10,
            padding: 5,
        },
        actionText: {
            flex: 1,
            fontSize: 14,
            color: theme.colors.textPrimary,
        },
        actionTextDone: {
            textDecorationLine: 'line-through',
            color: theme.colors.textSecondary,
        },
        actionMilestone: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginLeft: 8,
        },
        pathContent: {
            marginTop: 10,
        },
    });

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
                        width={18}
                        height={18}
                        color={action.done ? theme.colors.success : theme.colors.textSecondary}
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
            // Render just actions without milestones
            return (
                <View style={styles.pathContent}>
                    {path.actions && path.actions.map(renderAction)}
                </View>
            );
        }

        // Render milestones with their actions
        return (
            <View style={styles.pathContent}>
                {path.milestones.map(renderMilestone)}
            </View>
        );
    };

    const hasMilestonesOrActions =
        (path.milestones && path.milestones.length > 0) ||
        (path.actions && path.actions.length > 0);

    return (
        <EntryCard
            id={path.id}
            title={path.title}
            subtitle={subtitle}
            description={path.description}
            iconName="compass"
            iconColor={theme.colors.info}
            createdAt={path.createdAt}
            tags={path.tags}
            categoryId={path.categoryId}
            onPress={onPress}
            isStarred={path.isStarred}
            onStar={handleStar}
            onDuplicate={handleDuplicate}
            onArchive={handleArchive}
            onHide={handleHide}
            expanded={expanded}
            onExpand={hasMilestonesOrActions ? handleToggleExpand : undefined}
            children={renderPathContent()}
        />
    );
};