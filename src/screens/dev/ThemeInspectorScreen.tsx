// src/screens/ThemeInspectorScreen.tsx
import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Card } from '../../components/common';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ThemeInspectorScreen() {
    const { theme, toggleTheme, isDark } = useTheme();

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            padding: theme.spacing.m,
        },
        header: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            marginTop: theme.spacing.l,
            marginBottom: theme.spacing.s,
        },
        card: {
            marginBottom: theme.spacing.m,
        },
        colorGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
        },
        colorItem: {
            width: '30%',
            margin: '1.5%',
            aspectRatio: 1,
            borderRadius: theme.shape.radius.s,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: theme.spacing.xs,
        },
        colorBox: {
            flex: 1,
            borderRadius: theme.shape.radius.s,
            marginBottom: theme.spacing.xs,
        },
        colorName: {
            fontSize: theme.typography.fontSize.xs,
            textAlign: 'center',
        },
        spacingContainer: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginTop: theme.spacing.m,
        },
        spacingBox: {
            backgroundColor: theme.colors.primary,
            width: 20,
            marginRight: theme.spacing.s,
        },
        typographyRow: {
            marginBottom: theme.spacing.m,
        },
        toggleButton: {
            backgroundColor: theme.colors.primary,
            padding: theme.spacing.m,
            borderRadius: theme.shape.radius.m,
            alignItems: 'center',
            marginVertical: theme.spacing.m,
        },
        toggleButtonText: {
            color: theme.colors.onPrimary,
            fontWeight: theme.typography.fontWeight.medium,
        },
    }));

    // Extract color swatches from theme
    const renderColorSwatches = () => {
        const colorCategories = [
            {
                title: 'Brand Colors',
                colors: [
                    { name: 'primary', value: theme.colors.primary },
                    { name: 'primaryLight', value: theme.colors.primaryLight },
                    { name: 'primaryDark', value: theme.colors.primaryDark },
                    { name: 'onPrimary', value: theme.colors.onPrimary },
                    { name: 'secondary', value: theme.colors.secondary },
                    { name: 'secondaryLight', value: theme.colors.secondaryLight },
                    { name: 'secondaryDark', value: theme.colors.secondaryDark },
                    { name: 'onSecondary', value: theme.colors.onSecondary },
                ],
            },
            {
                title: 'UI Colors',
                colors: [
                    { name: 'background', value: theme.colors.background },
                    { name: 'surface', value: theme.colors.surface },
                    { name: 'surfaceVariant', value: theme.colors.surfaceVariant },
                    { name: 'border', value: theme.colors.border },
                    { name: 'divider', value: theme.colors.divider },
                ],
            },
            {
                title: 'Text Colors',
                colors: [
                    { name: 'textPrimary', value: theme.colors.textPrimary },
                    { name: 'textSecondary', value: theme.colors.textSecondary },
                    { name: 'textDisabled', value: theme.colors.textDisabled },
                    { name: 'textLink', value: theme.colors.textLink },
                ],
            },
            {
                title: 'Status Colors',
                colors: [
                    { name: 'error', value: theme.colors.error },
                    { name: 'warning', value: theme.colors.warning },
                    { name: 'success', value: theme.colors.success },
                    { name: 'info', value: theme.colors.info },
                ],
            },
        ];

        return colorCategories.map((category, index) => (
            <View key={index}>
                <Typography variant="h3" style={styles.sectionTitle}>{category.title}</Typography>
                <View style={styles.colorGrid}>
                    {category.colors.map((color, colorIndex) => (
                        <View key={colorIndex} style={styles.colorItem}>
                            <View style={[styles.colorBox, { backgroundColor: color.value }]} />
                            <Typography variant="caption" style={styles.colorName}>
                                {color.name}
                            </Typography>
                        </View>
                    ))}
                </View>
            </View>
        ));
    };

    // Render spacing examples
    const renderSpacing = () => {
        const spacingKeys = Object.keys(theme.spacing);

        return (
            <>
                <Typography variant="h3" style={styles.sectionTitle}>Spacing</Typography>
                <View style={styles.spacingContainer}>
                    {spacingKeys.map((key) => (
                        <View
                            key={key}
                            style={[
                                styles.spacingBox,
                                { height: theme.spacing[key as keyof typeof theme.spacing] }
                            ]}
                        >
                            <Typography variant="caption" style={styles.colorName}>
                                {key}
                            </Typography>
                        </View>
                    ))}
                </View>
            </>
        );
    };

    // Render typography examples
    const renderTypography = () => {
        const variants = [
            'h1', 'h2', 'h3', 'h4',
            'body1', 'body2', 'caption',
            'button', 'overline'
        ];

        return (
            <>
                <Typography variant="h3" style={styles.sectionTitle}>Typography</Typography>
                {variants.map((variant) => (
                    <View key={variant} style={styles.typographyRow}>
                        <Typography variant={variant as any}>
                            {variant} - The quick brown fox jumps over the lazy dog
                        </Typography>
                    </View>
                ))}
            </>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Typography variant="h1">Theme Inspector</Typography>
                        <Typography variant="body1" color="secondary">
                            Current theme: {theme.name}
                        </Typography>
                    </View>

                    <TouchableOpacity style={styles.toggleButton} onPress={toggleTheme}>
                        <Typography style={styles.toggleButtonText}>
                            Switch to {isDark ? 'Light' : 'Dark'} Theme
                        </Typography>
                    </TouchableOpacity>

                    <Card style={styles.card} elevated>
                        {renderColorSwatches()}
                    </Card>

                    <Card style={styles.card}>
                        {renderSpacing()}
                    </Card>

                    <Card style={styles.card}>
                        {renderTypography()}
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}