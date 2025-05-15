// src/components/vault/VaultEmptyState.tsx
import React from 'react';
import { View } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { Icon, IconName } from '../../components/common/Icon';

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
    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        icon: {
            marginBottom: theme.spacing.m,
        },
        title: {
            marginBottom: theme.spacing.s,
        },
        description: {
            textAlign: 'center',
            marginBottom: theme.spacing.l,
        },
    }));

    // Determine the message based on type and if filters are applied
    const getMessage = () => {
        if (hasFiltersApplied) {
            return {
                title: 'No Results Found',
                description: 'Try adjusting your filters or search terms.',
            };
        }

        switch (type) {
            case 'notes':
                return {
                    title: 'No Notes Yet',
                    description: 'Create your first note to start capturing ideas.',
                };
            case 'sparks':
                return {
                    title: 'No Sparks Yet',
                    description: 'Capture your insights and inspirations as sparks.',
                };
            case 'actions':
                return {
                    title: 'No Actions Yet',
                    description: 'Create your first action to start getting things done.',
                };
            case 'paths':
                return {
                    title: 'No Paths Yet',
                    description: 'Create your first path to define your journey.',
                };
            case 'loops':
                return {
                    title: 'No Loops Yet',
                    description: 'Create your first loop to establish repeating patterns.',
                };
            case 'all':
            default:
                return {
                    title: 'No Entries Yet',
                    description: 'Create your first entry to get started.',
                };
        }
    };

    const { title, description } = getMessage();
    const buttonLabel = `Create ${type === 'all' ? 'Entry' : type.slice(0, -1)}`;

    return (
        <View style={styles.container}>
            <Icon
                name={icon}
                width={48}
                height={48}
                color="#CCCCCC"
                style={styles.icon}
            />
            <Typography variant="h3" style={styles.title}>
                {title}
            </Typography>
            <Typography variant="body1" style={styles.description}>
                {description}
            </Typography>
            <Button
                label={buttonLabel}
                leftIcon={icon}
                onPress={onCreatePress}
                variant="primary"
            />
        </View>
    );
};