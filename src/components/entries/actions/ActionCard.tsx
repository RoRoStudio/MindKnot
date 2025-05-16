// src/components/entries/actions/ActionCard.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Action } from '../../../types/action';
import { EntryCard } from '../EntryCard';
import { useTheme } from '../../../contexts/ThemeContext';
import { Typography } from '../../common/Typography';
import { Icon } from '../../common/Icon';

interface ActionCardProps {
    action: Action;
    onPress?: () => void;
    onToggleDone?: (id: string) => void;
    onStar?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onArchive?: (id: string) => void;
    onHide?: (id: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
    action,
    onPress,
    onToggleDone,
    onStar,
    onDuplicate,
    onArchive,
    onHide
}) => {
    const { theme } = useTheme();
    const [expanded, setExpanded] = useState(false);

    const handleToggleDone = (e: any) => {
        e.stopPropagation();
        if (onToggleDone) {
            onToggleDone(action.id);
        }
    };

    const handlePress = () => {
        if (onPress) {
            onPress();
        }
    };

    // Handle quick actions
    const handleStar = () => {
        if (onStar) onStar(action.id);
    };

    const handleDuplicate = () => {
        if (onDuplicate) onDuplicate(action.id);
    };

    const handleArchive = () => {
        if (onArchive) onArchive(action.id);
    };

    const handleHide = () => {
        if (onHide) onHide(action.id);
    };

    const handleToggleExpand = () => {
        setExpanded(!expanded);
    };

    const renderSubAction = (subAction: any, index: number) => {
        return (
            <View key={subAction.id || index} style={styles.subAction}>
                <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => {
                        if (onToggleDone) {
                            onToggleDone(subAction.id);
                        }
                    }}
                >
                    <Icon
                        name={subAction.done ? "square-check" : "square"}
                        width={18}
                        height={18}
                        color={subAction.done ? theme.colors.success : theme.colors.textSecondary}
                    />
                </TouchableOpacity>
                <Typography
                    style={[
                        styles.subActionText,
                        subAction.done && styles.subActionTextDone
                    ]}
                >
                    {subAction.title}
                </Typography>
            </View>
        );
    };

    const styles = StyleSheet.create({
        checkbox: {
            marginRight: 10,
            padding: 5, // Increase touch target
        },
        subActionsContainer: {
            marginTop: 10,
        },
        subAction: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            marginVertical: 4,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.s,
        },
        subActionText: {
            flex: 1,
            fontSize: 14,
            color: theme.colors.textPrimary,
        },
        subActionTextDone: {
            textDecorationLine: 'line-through',
            color: theme.colors.textSecondary,
        },
    });

    const subActions = action.subActions && action.subActions.length > 0
        ? (
            <View style={styles.subActionsContainer}>
                {action.subActions.map(renderSubAction)}
            </View>
        )
        : null;

    return (
        <EntryCard
            id={action.id}
            title={action.title}
            description={action.body}
            iconName="check"
            iconColor={theme.colors.success}
            createdAt={action.createdAt}
            tags={action.tags}
            categoryId={action.categoryId}
            onPress={handlePress}
            done={action.done}
            dueDate={action.dueDate}
            isStarred={action.isStarred}
            onStar={handleStar}
            onDuplicate={handleDuplicate}
            onArchive={handleArchive}
            onHide={handleHide}
            expanded={expanded}
            onExpand={action.subActions && action.subActions.length > 0 ? handleToggleExpand : undefined}
            children={subActions}
        />
    );
};