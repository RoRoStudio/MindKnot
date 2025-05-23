// src/components/entries/sparks/SparkCard.tsx
import React, { useState, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Spark } from '../../../types/spark';
import { EntryCard } from '../EntryCard';
import { ENTRY_TYPES, EntryType } from '../../../constants/entryTypes';

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
    const [animValue] = useState(new Animated.Value(isNew ? 0 : 1));

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
                iconName={ENTRY_TYPES[EntryType.SPARK].icon}
                borderColor={ENTRY_TYPES[EntryType.SPARK].borderColor}
                createdAt={spark.createdAt}
                tags={spark.tags}
                categoryId={spark.categoryId}
                onPress={onPress}
                isStarred={spark.isStarred}
                onStar={handleStar}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                onHide={handleHide}
                // Sparks don't need to be expandable
                expandable={false}
                navigationScreen="SparkScreen"
            />
        </Animated.View>
    );
};