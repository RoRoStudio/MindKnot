// src/components/common/Card.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewProps, TouchableOpacity } from 'react-native';
import { useStyles } from '../../hooks/useStyles';

interface CardProps extends ViewProps {
    title?: string;
    onPress?: () => void;
    children: React.ReactNode;
    elevated?: boolean;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    title,
    onPress,
    children,
    elevated = false,
    noPadding = false,
    style,
    ...props
}) => {
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

    const CardComponent = onPress ? TouchableOpacity : View;

    return (
        <CardComponent
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            {...props}
        >
            {title && <Text style={styles.title}>{title}</Text>}
            {children}
        </CardComponent>
    );
};