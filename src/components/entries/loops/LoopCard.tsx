// src/components/entries/loops/LoopCard.tsx
import React from 'react';
import { Loop } from '../../../types/loop';
import { EntryCard } from '../EntryCard';
import { ENTRY_TYPES, EntryType } from '../../../constants/entryTypes';

interface LoopCardProps {
    loop: Loop;
    onPress?: () => void;
    onEntryUpdated?: () => void;
}

export const LoopCard: React.FC<LoopCardProps> = ({
    loop,
    onPress,
    onEntryUpdated
}) => {
    // Parse the frequency for display
    let frequencyText = 'Custom schedule';

    try {
        if (!loop.frequency) {
            frequencyText = 'Custom schedule';
        } else if (typeof loop.frequency === 'string') {
            // Check if it's a simple string first
            if (loop.frequency === 'daily') {
                frequencyText = 'Daily';
            } else if (loop.frequency === 'weekly') {
                frequencyText = 'Weekly';
            } else if (loop.frequency === 'weekdays') {
                frequencyText = 'Weekdays';
            } else if (loop.frequency === 'weekends') {
                frequencyText = 'Weekends';
            } else {
                // Try to parse as JSON
                try {
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
                } catch (e) {
                    // Not a valid JSON, use the string as is
                    frequencyText = `${loop.frequency}`;
                }
            }
        } else if (typeof loop.frequency === 'object' && loop.frequency !== null) {
            // It's already an object
            const frequency = loop.frequency as any;

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
        console.error('Error parsing frequency:', e, loop.frequency);
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
            iconName={ENTRY_TYPES[EntryType.LOOP].icon}
            borderColor={ENTRY_TYPES[EntryType.LOOP].color}
            createdAt={loop.createdAt}
            tags={loop.tags}
            categoryId={loop.categoryId}
            onPress={onPress}
            isStarred={loop.isStarred}
            entryType="loop"
            onEntryUpdated={onEntryUpdated}
            // Loops don't need to be expandable for now
            expandable={false}
            navigationScreen="LoopScreen"
        />
    );
};