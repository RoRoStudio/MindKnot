// src/components/entries/actions/ActionCard.tsx
import React from 'react';
import { Action } from '../../../types/action';
import { EntryCard } from '../EntryCard';
import { useTheme } from '../../../contexts/ThemeContext';

interface ActionCardProps {
    action: Action;
    onPress?: () => void;
    onToggleDone?: (id: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
    action,
    onPress,
    onToggleDone
}) => {
    const { theme } = useTheme();

    const handlePress = () => {
        if (onToggleDone) {
            onToggleDone(action.id);
        } else if (onPress) {
            onPress();
        }
    };

    return (
        <EntryCard
            id={action.id}
            title={action.title}
            description={action.body}
            iconName="check"
            iconColor={theme.colors.success}
            createdAt={action.createdAt}
            tags={action.tags}
            onPress={handlePress}
            done={action.done}
            dueDate={action.dueDate}
        />
    );
};