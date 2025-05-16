// src/components/common/Card.tsx
import React from 'react';
import { View, Text, ViewProps, TouchableOpacity } from 'react-native';
import { useStyles } from '../../hooks/useStyles';

// Pre-declare component types to prevent re-creation
const TouchableView = TouchableOpacity;
const StaticView = View;

interface CardProps extends ViewProps {
    title?: string;
    onPress?: () => void;
    children: React.ReactNode;
    elevated?: boolean;
    noPadding?: boolean;
}

// Using React.memo to prevent unnecessary re-renders
export const Card = React.memo(function Card({
    title,
    onPress,
    children,
    elevated = false,
    noPadding = false,
    style,
    ...props
}: CardProps) {
    const styles = useStyles((theme) => ({
        container: {
            backgroundColor: theme.components.card.background,
            borderRadius: theme.components.card.radius,
            borderWidth: 1,
            borderColor: theme.components.card.border,
            padding: noPadding ? 0 : theme.spacing.m,
            ...(elevated && {
                ...theme.elevation.z2,
                borderWidth: 0,
            }),
        },
        title: {
            color: theme.components.card.titleColor,
            fontSize: theme.typography.fontSize.l,
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.s,
        },
    }));

    if (onPress) {
        return (
            <TouchableOpacity
                style={[styles.container, style]}
                onPress={onPress}
                activeOpacity={0.7}
                {...props}
            >
                {title && <Text style={styles.title}>{title}</Text>}
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View
            style={[styles.container, style]}
            {...props}
        >
            {title && <Text style={styles.title}>{title}</Text>}
            {children}
        </View>
    );
});