import React from 'react';
import { View, ViewProps, TouchableOpacity } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from './Typography';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Props for the Card component
 */
export interface CardProps extends ViewProps {
    /**
     * Optional title to display at the top of the card
     */
    title?: string;

    /**
     * Optional press handler for making the card interactive
     */
    onPress?: () => void;

    /**
     * Content to render inside the card
     */
    children: React.ReactNode;

    /**
     * Whether the card should have elevation styles
     * @default false
     */
    elevated?: boolean;

    /**
     * Whether the card should have padding removed
     * @default false
     */
    noPadding?: boolean;
}

/**
 * Card component provides a container with optional title, elevation and touch functionality
 * Used for grouping related content with consistent styling
 */
export const Card = React.memo<CardProps>(function Card({
    title,
    onPress,
    children,
    elevated = false,
    noPadding = false,
    style,
    ...props
}) {
    const { theme } = useTheme();

    const styles = useStyles((theme) => ({
        container: {
            backgroundColor: theme.components.card.background,
            borderRadius: theme.components.card.radius,
            padding: noPadding ? 0 : theme.spacing.m,
            ...(elevated ? {
                // Apply elevation styles
                ...theme.elevation.s,
                borderWidth: 0,
            } : {
                // Apply border styles
                borderWidth: 1,
                borderColor: theme.components.card.border,
            }),
            // Ensure the card has a proper shadow
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: elevated ? 3 : 1,
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
                {title && <Typography variant="h4" style={styles.title}>{title}</Typography>}
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View
            style={[styles.container, style]}
            {...props}
        >
            {title && <Typography variant="h4" style={styles.title}>{title}</Typography>}
            {children}
        </View>
    );
}); 