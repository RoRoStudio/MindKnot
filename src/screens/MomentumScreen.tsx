// src/screens/MomentumScreen.tsx
import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Icon } from '../components/common/Icon';

export default function MomentumScreen() {
    const { theme, isDark } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
            padding: theme.spacing.m,
            justifyContent: 'center',
            alignItems: 'center',
        },
        card: {
            padding: theme.spacing.l,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
        },
        icon: {
            marginBottom: theme.spacing.m,
        },
        title: {
            marginBottom: theme.spacing.s,
            textAlign: 'center',
        },
        description: {
            textAlign: 'center',
            marginBottom: theme.spacing.m,
        },
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Card style={styles.card} elevated>
                    <Icon
                        name="zap"
                        width={64}
                        height={64}
                        color={theme.colors.primary}
                        style={styles.icon}
                    />
                    <Typography variant="h2" style={styles.title}>
                        Your Momentum
                    </Typography>
                    <Typography style={styles.description}>
                        This screen will focus on your progress and trajectory. You'll see statistics, streaks, completed actions, path progress, and mood/reflection graphs to reinforce your sense of growth and consistency.
                    </Typography>
                    <Typography color="secondary">
                        Coming soon in the next update!
                    </Typography>
                </Card>
            </View>
        </SafeAreaView>
    );
}