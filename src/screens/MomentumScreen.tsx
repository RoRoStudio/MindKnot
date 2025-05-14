// src/screens/MomentumScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useStyles } from '../hooks/useStyles';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Icon } from '../components/common/Icon';
import { useCaptures } from '../hooks/useCaptures';
import { useLoops } from '../hooks/useLoops';
import { usePaths } from '../hooks/usePaths';
import { CaptureSubType } from '../types/capture';

export default function MomentumScreen() {
    const { theme } = useTheme();
    const { captures, loadCaptures } = useCaptures();
    const { loops, loadLoops } = useLoops();
    const { paths, loadPaths } = usePaths();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCaptures: 0,
        totalNotes: 0,
        totalSparks: 0,
        totalActions: 0,
        totalReflections: 0,
        completedActions: 0,
        activePaths: 0,
        activeLoops: 0,
        capturesThisWeek: 0,
    });

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
        },
        title: {
            marginBottom: theme.spacing.s,
        },
        content: {
            flex: 1,
            padding: theme.spacing.m,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            marginBottom: theme.spacing.s,
        },
        statsCard: {
            marginBottom: theme.spacing.m,
        },
        statsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.s,
        },
        statBox: {
            flex: 1,
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginHorizontal: theme.spacing.xs,
        },
        statValue: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.primary,
            marginBottom: theme.spacing.xs,
        },
        streakCard: {
            marginBottom: theme.spacing.m,
            padding: theme.spacing.m,
        },
        streakDays: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing.m,
        },
        streakDay: {
            alignItems: 'center',
            width: 40,
        },
        streakDot: {
            width: 24,
            height: 24,
            borderRadius: 12,
            marginBottom: theme.spacing.xs,
        },
        recentActivity: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.s,
            marginBottom: theme.spacing.s,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
        },
        activityIcon: {
            marginRight: theme.spacing.s,
        },
        activityText: {
            flex: 1,
        },
    }));

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load all data for stats
                await Promise.all([
                    loadCaptures(),
                    loadLoops(),
                    loadPaths(),
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        // Calculate stats from loaded data
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const notes = captures.filter(c => c.subType === CaptureSubType.NOTE);
        const sparks = captures.filter(c => c.subType === CaptureSubType.SPARK);
        const actions = captures.filter(c => c.subType === CaptureSubType.ACTION);
        const reflections = captures.filter(c => c.subType === CaptureSubType.REFLECTION);

        const completedActions = actions.filter(a => a.done).length;

        const capturesThisWeek = captures.filter(c =>
            new Date(c.createdAt) >= oneWeekAgo
        ).length;

        const activePaths = paths.filter(p => {
            const startDate = p.startDate ? new Date(p.startDate) : null;
            const targetDate = p.targetDate ? new Date(p.targetDate) : null;

            return (startDate && startDate <= now) &&
                (!targetDate || targetDate >= now);
        }).length;

        const activeLoops = loops.length; // Simplified for now

        setStats({
            totalCaptures: captures.length,
            totalNotes: notes.length,
            totalSparks: sparks.length,
            totalActions: actions.length,
            totalReflections: reflections.length,
            completedActions,
            activePaths,
            activeLoops,
            capturesThisWeek,
        });
    }, [captures, loops, paths]);

    // Generate mock streak data
    const generateMockStreak = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => {
            const active = Math.random() > 0.3; // 70% chance of being active
            return { day, active };
        });
    };

    const streakData = generateMockStreak();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Typography variant="h1" style={styles.title}>Momentum</Typography>
                <Typography variant="body1">Track your progress and growth</Typography>
            </View>

            <ScrollView style={styles.content}>
                {/* Weekly Stats */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>This Week</Typography>
                    <Card style={styles.statsCard}>
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Typography style={styles.statValue}>{stats.capturesThisWeek}</Typography>
                                <Typography>Total Captures</Typography>
                            </View>

                            <View style={styles.statBox}>
                                <Typography style={styles.statValue}>{stats.completedActions}</Typography>
                                <Typography>Actions Done</Typography>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Typography style={styles.statValue}>{stats.activePaths}</Typography>
                                <Typography>Active Paths</Typography>
                            </View>

                            <View style={styles.statBox}>
                                <Typography style={styles.statValue}>{stats.activeLoops}</Typography>
                                <Typography>Active Loops</Typography>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Streaks */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Daily Streak</Typography>
                    <Card style={styles.streakCard}>
                        <Typography variant="h4">Your Writing Streak</Typography>
                        <Typography variant="body2" color="secondary">
                            Consistency builds momentum. Keep writing daily!
                        </Typography>

                        <View style={styles.streakDays}>
                            {streakData.map((day, index) => (
                                <View key={index} style={styles.streakDay}>
                                    <View
                                        style={[
                                            styles.streakDot,
                                            {
                                                backgroundColor: day.active ?
                                                    theme.colors.primary :
                                                    theme.colors.surfaceVariant,
                                                borderWidth: 1,
                                                borderColor: day.active ?
                                                    theme.colors.primary :
                                                    theme.colors.border,
                                            }
                                        ]}
                                    />
                                    <Typography variant="caption">{day.day}</Typography>
                                </View>
                            ))}
                        </View>
                    </Card>
                </View>

                {/* Totals */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Progress</Typography>
                    <Card style={styles.statsCard}>
                        <Typography variant="h4" style={{ marginBottom: 12 }}>Entry Totals</Typography>

                        <View style={styles.recentActivity}>
                            <Icon name="file-text" width={20} height={20} color={theme.colors.primary} style={styles.activityIcon} />
                            <Typography style={styles.activityText}>Notes</Typography>
                            <Typography variant="h4">{stats.totalNotes}</Typography>
                        </View>

                        <View style={styles.recentActivity}>
                            <Icon name="lightbulb" width={20} height={20} color="#FFB800" style={styles.activityIcon} />
                            <Typography style={styles.activityText}>Insights</Typography>
                            <Typography variant="h4">{stats.totalSparks}</Typography>
                        </View>

                        <View style={styles.recentActivity}>
                            <Icon name="check" width={20} height={20} color={theme.colors.success} style={styles.activityIcon} />
                            <Typography style={styles.activityText}>Actions</Typography>
                            <Typography variant="h4">{stats.totalActions}</Typography>
                        </View>

                        <View style={styles.recentActivity}>
                            <Icon name="sparkles" width={20} height={20} color={theme.colors.accent} style={styles.activityIcon} />
                            <Typography style={styles.activityText}>Reflections</Typography>
                            <Typography variant="h4">{stats.totalReflections}</Typography>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}