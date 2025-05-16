// src/screens/vault/VaultEmptyState.tsx
import React from 'react';
import { View, Animated } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Button, Icon, IconName } from '../../components/common';
import { useTheme } from '../../contexts/ThemeContext';
import { useRef, useEffect } from 'react';

interface VaultEmptyStateProps {
    type: 'notes' | 'sparks' | 'actions' | 'paths' | 'loops' | 'all';
    onCreatePress: () => void;
    icon: IconName;
    hasFiltersApplied?: boolean;
}

export const VaultEmptyState: React.FC<VaultEmptyStateProps> = ({
    type,
    onCreatePress,
    icon,
    hasFiltersApplied = false,
}) => {
    // Animation values
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Animate in the empty state
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const { theme } = useTheme();
    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        icon: {
            marginBottom: theme.spacing.m,
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.circle,
        },
        title: {
            marginBottom: theme.spacing.s,
        },
        description: {
            textAlign: 'center',
            marginBottom: theme.spacing.l,
            maxWidth: '90%',
        },
        buttonContainer: {
            marginTop: theme.spacing.m,
        },
        button: {
            minWidth: 160,
        },
    }));

    // Determine the message based on type and if filters are applied
    const getMessage = () => {
        if (hasFiltersApplied) {
            return {
                title: 'No Results Found',
                description: 'Try adjusting your filters or search terms to find what you\'re looking for.',
            };
        }

        switch (type) {
            case 'notes':
                return {
                    title: 'No Notes Yet',
                    description: 'Create your first note to start capturing your thoughts, ideas, and important information.',
                };
            case 'sparks':
                return {
                    title: 'No Sparks Yet',
                    description: 'Capture your insights and inspirations as sparks. These can later be turned into actions.',
                };
            case 'actions':
                return {
                    title: 'No Actions Yet',
                    description: 'Create your first action to start getting things done. Track progress and set due dates.',
                };
            case 'paths':
                return {
                    title: 'No Paths Yet',
                    description: 'Create your first path to define your journey. Set milestones and track your progress over time.',
                };
            case 'loops':
                return {
                    title: 'No Loops Yet',
                    description: 'Create your first loop to establish repeating patterns and habits. Set daily, weekly, or custom schedules.',
                };
            case 'all':
            default:
                return {
                    title: 'No Entries Yet',
                    description: 'Create your first entry to get started with MindKnot. Capture thoughts, set goals, and track your progress.',
                };
        }
    };

    const { title, description } = getMessage();
    const buttonLabel = `Create ${type === 'all' ? 'Entry' : type.slice(0, -1)}`;

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity, transform: [{ translateY }] }
            ]}
        >
            <View style={styles.icon}>
                <Icon
                    name={icon}
                    width={48}
                    height={48}
                    color={theme.colors.primary}
                />
            </View>
            <Typography variant="h3" style={styles.title}>
                {title}
            </Typography>
            <Typography variant="body1" style={styles.description} color="secondary">
                {description}
            </Typography>
            <View style={styles.buttonContainer}>
                <Button
                    label={buttonLabel}
                    leftIcon={icon}
                    onPress={onCreatePress}
                    variant="primary"
                    style={styles.button}
                />
            </View>
        </Animated.View>
    );
};