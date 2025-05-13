// src/components/form/FormErrorMessage.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Icon } from '../common/Icon';

interface FormErrorMessageProps {
    message?: string;
    visible?: boolean;
}

export default function FormErrorMessage({ message, visible = true }: FormErrorMessageProps) {
    const styles = useStyles((theme) => ({
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
                    name="alert-circle"
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