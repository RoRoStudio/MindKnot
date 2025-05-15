// src/components/entries/LoopCard.tsx
import React from 'react';
import { Loop } from '../../types/loop';
import { EntryCard } from './EntryCard';
import { useTheme } from '../../contexts/ThemeContext';

interface LoopCardProps {
    loop: Loop;
    onPress?: () => void;
}

export const LoopCard: React.FC<LoopCardProps> = ({ loop, onPress }) => {
    const { theme } = useTheme();

    // Parse the frequency for display
    let frequencyText = '';
    try {
        if (typeof loop.frequency === 'string') {
            const frequency = JSON.parse(loop.frequency);
            if (frequency.type === 'daily') {
                frequencyText = 'Daily';
            } else if (frequency.type === 'weekly') {
                frequencyText = `Weekly on ${frequency.day || 'Monday'}`;
            } else if (frequency.type === 'weekdays') {
                frequencyText = 'Weekdays';
            } else if (frequency.type === 'weekends') {
                frequencyText = 'Weekends';
            } else if (frequency.type === 'custom' && frequency.days) {
                frequencyText = `Custom: ${frequency.days.join(', ')}`;
            }
        }
    } catch (e) {
        console.error('Error parsing frequency:', e);
        frequencyText = 'Custom schedule';
    }

    // Format subtitle
    const subtitle = loop.items?.length
        ? `${loop.items.length} item${loop.items.length !== 1 ? 's' : ''} • ${frequencyText}`
        : frequencyText;

    return (
        <EntryCard
            id={loop.id}
            title={loop.title}
            subtitle={subtitle}
            description={loop.description}
            iconName="calendar-sync"
            iconColor={theme.colors.secondary}
            createdAt={loop.createdAt}
            tags={loop.tags}
            onPress={onPress}
        />
    );
};