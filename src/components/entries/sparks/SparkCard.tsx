// src/components/entries/sparks/SparkCard.tsx
import React, { useState, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Spark } from '../../../types/spark';
import { EntryCard } from '../EntryCard';
import { useTheme } from '../../../contexts/ThemeContext';

interface SparkCardProps {
    spark: Spark;
    onPress?: () => void;
    onStar?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onArchive?: (id: string) => void;
    onHide?: (id: string) => void;
    isNew?: boolean;
}

export const SparkCard: React.FC<SparkCardProps> = ({
    spark,
    onPress,
    onStar,
    onDuplicate,
    onArchive,
    onHide,
    isNew = false
}) => {
    const { theme } = useTheme();
    const [animValue] = useState(new Animated.Value(isNew ? 0 : 1));

    // For Sparks, we have a different color
    const sparkColor = '#FFB800'; // Golden color

    useEffect(() => {
        if (isNew) {
            Animated.timing(animValue, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        }
    }, [isNew]);

    // Handle quick actions
    const handleStar = () => {
        if (onStar) onStar(spark.id);
    };

    const handleDuplicate = () => {
        if (onDuplicate) onDuplicate(spark.id);
    };

    const handleArchive = () => {
        if (onArchive) onArchive(spark.id);
    };

    const handleHide = () => {
        if (onHide) onHide(spark.id);
    };

    const cardStyle = {
        opacity: animValue,
        transform: [
            {
                translateY: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                }),
            },
        ],
    };

    return (
        <Animated.View style={cardStyle}>
            <EntryCard
                id={spark.id}
                title={spark.title}
                description={spark.body}
                iconName="lightbulb"
                iconColor={sparkColor}
                createdAt={spark.createdAt}
                tags={spark.tags}
                categoryId={spark.categoryId}
                onPress={onPress}
                isStarred={spark.isStarred}
                onStar={handleStar}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                onHide={handleHide}
            />
        </Animated.View>
    );
};