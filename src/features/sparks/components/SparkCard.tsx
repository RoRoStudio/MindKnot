// src/components/entries/sparks/SparkCard.tsx
import React, { useState, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import { Spark } from '../../../shared/types/spark';
import { EntryCard } from '../../../shared/components';
import { ENTRY_TYPES, EntryType } from '../../../shared/constants/entryTypes';

interface SparkCardProps {
    spark: Spark;
    onPress?: () => void;
    onEntryUpdated?: () => void;
    isNew?: boolean;
}

export const SparkCard: React.FC<SparkCardProps> = ({
    spark,
    onPress,
    onEntryUpdated,
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
                borderColor={ENTRY_TYPES[EntryType.SPARK].color}
                createdAt={spark.createdAt}
                tags={spark.tags}
                categoryId={spark.categoryId}
                onPress={onPress}
                isStarred={spark.isStarred}
                entryType="spark"
                onEntryUpdated={onEntryUpdated}
                // Sparks don't need to be expandable
                expandable={false}
                navigationScreen="SparkScreen"
            />
        </Animated.View>
    );
};