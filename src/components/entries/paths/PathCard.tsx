// src/components/entries/PathCard.tsx
import React from 'react';
import { Path } from '../../../types/path';
import { EntryCard } from '../EntryCard';
import { useTheme } from '../../../contexts/ThemeContext';

interface PathCardProps {
    path: Path;
    onPress?: () => void;
}

export const PathCard: React.FC<PathCardProps> = ({ path, onPress }) => {
    const { theme } = useTheme();

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
            onPress={onPress}
        />
    );
};