// src/screens/vault/VaultLoopsScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../components';
import { useTheme } from '../../app/contexts/ThemeContext';

export default function VaultLoopsScreen() {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },
        title: {
            fontSize: 24,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 16,
            textAlign: 'center',
        },
        message: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
        },
    });

    return (
        <View style={styles.container}>
            <Typography style={styles.title}>
                Loops Coming Soon
            </Typography>
            <Typography style={styles.message}>
                The loop feature is being rebuilt from scratch with a fresh implementation.
                {'\n\n'}
                Check back soon for the new and improved loop experience!
            </Typography>
        </View>
    );
}