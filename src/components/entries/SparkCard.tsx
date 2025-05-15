// src/components/entries/SparkCard.tsx
import React from 'react';
import { Spark } from '../../types/spark';
import { EntryCard } from './EntryCard';
import { useTheme } from '../../contexts/ThemeContext';

interface SparkCardProps {
    spark: Spark;
    onPress?: () => void;
}

export const SparkCard: React.FC<SparkCardProps> = ({ spark, onPress }) => {
    const { theme } = useTheme();

    // For Sparks, we have a different color
    const sparkColor = '#FFB800'; // Golden color

    return (
        <EntryCard
            id={spark.id}
            title={spark.title}
            description={spark.body}
            iconName="lightbulb"
            iconColor={sparkColor}
            createdAt={spark.createdAt}
            tags={spark.tags}
            onPress={onPress}
        />
    );
};