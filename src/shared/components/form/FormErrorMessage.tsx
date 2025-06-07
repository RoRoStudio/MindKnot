// src/components/form/FormErrorMessage.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Typography } from '../Typography';
import { Icon } from '../Icon';

interface FormErrorMessageProps {
    message?: string;
    visible?: boolean;
}

export function FormErrorMessage({ message, visible = true }: FormErrorMessageProps) {
    const styles = useThemedStyles((theme) => ({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing.xs,
        },
        iconContainer: {
            marginRight: theme.spacing.xs,
        },
        text: {
            color: theme.colors.error,
            flex: 1,
        },
    }));

    if (!visible || !message) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Icon
                    name="circle-alert"
                    width={14}
                    height={14}
                    color={styles.text.color}
                />
            </View>
            <Typography variant="caption" style={styles.text}>
                {message}
            </Typography>
        </View>
    );
}