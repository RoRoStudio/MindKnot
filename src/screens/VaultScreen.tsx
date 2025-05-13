// src/screens/VaultScreen.tsx
import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Icon } from '../components/common/Icon';

export default function VaultScreen() {
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
                        name="vault"
                        width={64}
                        height={64}
                        color={theme.colors.primary}
                        style={styles.icon}
                    />
                    <Typography variant="h2" style={styles.title}>
                        Your Vault
                    </Typography>
                    <Typography style={styles.description}>
                        This is where you'll find a complete archive of everything you've added: captures, loops, paths, and more. You'll be able to filter by saga, type, date, tags, and more.
                    </Typography>
                    <Typography color="secondary">
                        Coming soon in the next update!
                    </Typography>
                </Card>
            </View>
        </SafeAreaView>
    );
}