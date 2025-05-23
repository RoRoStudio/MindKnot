// src/screens/momentum/MomentumScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Card, Icon } from '../../components/common';
import { useNotes } from '../../hooks/useNotes';
import { useSparks } from '../../hooks/useSparks';
import { useActions } from '../../hooks/useActions';
import { usePaths } from '../../hooks/usePaths';
import { useLoops } from '../../hooks/useLoops';
import { ActionCard } from '../../components/entries';
import { Note } from '../../types/note';
import { Spark } from '../../types/spark';
import { Action } from '../../types/action';
import { Path } from '../../types/path';
import { Loop } from '../../types/loop';

export default function MomentumScreen() {
    const { theme } = useTheme();
    const { notes, loadNotes } = useNotes();
    const { sparks, loadSparks } = useSparks();
    const { actions, loadActions, toggleActionDone } = useActions();
    const { paths, loadPaths } = usePaths();
    const { loops, loadLoops } = useLoops();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalNotes: 0,
        totalSparks: 0,
        totalActions: 0,
        completedActions: 0,
        activePaths: 0,
        activeLoops: 0,
        entriesThisWeek: 0,
    });

    const styles = useStyles((theme) => ({
        container: { flex: 1, backgroundColor: theme.colors.background },
        header: { padding: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
        title: { marginBottom: theme.spacing.s },
        content: { flex: 1, padding: theme.spacing.m },
        section: { marginBottom: theme.spacing.l },
        sectionTitle: { marginBottom: theme.spacing.s },
        statsCard: { marginBottom: theme.spacing.m },
        statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.s },
        statBox: { flex: 1, alignItems: 'center', backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.shape.radius.m, padding: theme.spacing.m, marginHorizontal: theme.spacing.xs },
        statValue: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.xs },
        recentActivity: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.s, marginBottom: theme.spacing.s, backgroundColor: theme.colors.surfaceVariant, borderRadius: theme.shape.radius.m },
        activityIcon: { marginRight: theme.spacing.s },
        activityText: { flex: 1 },
        emptyCard: { padding: theme.spacing.m, alignItems: 'center' },
    }));

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([loadNotes(), loadSparks(), loadActions(), loadPaths(), loadLoops()]);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Check if arrays are valid and use type assertions
        const actionsArray = Array.isArray(actions) ? actions : [];
        const notesArray = Array.isArray(notes) ? notes : [];
        const sparksArray = Array.isArray(sparks) ? sparks : [];
        const pathsArray = Array.isArray(paths) ? paths : [];
        const loopsArray = Array.isArray(loops) ? loops : [];

        const completedActions = actionsArray.filter((a: Action) => a.done).length;
        const recentNotes = notesArray.filter((n: Note) => new Date(n.createdAt) >= oneWeekAgo).length;
        const recentSparks = sparksArray.filter((s: Spark) => new Date(s.createdAt) >= oneWeekAgo).length;
        const recentActions = actionsArray.filter((a: Action) => new Date(a.createdAt) >= oneWeekAgo).length;
        const entriesThisWeek = recentNotes + recentSparks + recentActions;

        const activePaths = pathsArray.filter((p: Path) => {
            const startDate = p.startDate ? new Date(p.startDate) : null;
            const targetDate = p.targetDate ? new Date(p.targetDate) : null;
            return (startDate && startDate <= now) && (!targetDate || targetDate >= now);
        }).length;

        const activeLoops = loopsArray.length;

        setStats({
            totalNotes: notesArray.length,
            totalSparks: sparksArray.length,
            totalActions: actionsArray.length,
            completedActions,
            activePaths,
            activeLoops,
            entriesThisWeek
        });
    }, [notes, sparks, actions, paths, loops]);

    const generateMockStreak = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({ day, active: Math.random() > 0.3 }));
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
                                <Typography style={styles.statValue}>{stats.entriesThisWeek}</Typography>
                                <Typography>Total Entries</Typography>
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

                {/* Progress */}
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
                            <Icon name="lightbulb" width={20} height={20} color={theme.colors.warning} style={styles.activityIcon} />
                            <Typography style={styles.activityText}>Sparks</Typography>
                            <Typography variant="h4">{stats.totalSparks}</Typography>
                        </View>
                        <View style={styles.recentActivity}>
                            <Icon name="check" width={20} height={20} color={theme.colors.success} style={styles.activityIcon} />
                            <Typography style={styles.activityText}>Actions</Typography>
                            <Typography variant="h4">{stats.totalActions}</Typography>
                        </View>
                    </Card>
                </View>

                {/* Upcoming Actions */}
                <View style={styles.section}>
                    <Typography variant="h3" style={styles.sectionTitle}>Upcoming Actions</Typography>
                    {actions.filter(a => !a.done && a.dueDate).length > 0 ? (
                        actions
                            .filter(a => !a.done && a.dueDate)
                            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                            .slice(0, 3)
                            .map(action => (
                                <ActionCard key={action.id} action={action} onToggleDone={toggleActionDone} />
                            ))
                    ) : (
                        <Card style={styles.emptyCard}>
                            <Typography>No upcoming actions</Typography>
                        </Card>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}