// src/screens/home/HomeScreen.tsx
import React, { useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../shared/types/navigation';
import { useTheme } from '../../app/contexts/ThemeContext';
import { Typography, Icon, IconName } from '../../shared/components';
import { NoteCard, SparkCard, ActionCard, PathCard } from '../../shared/components';
import { useNotes } from '../../features/notes/hooks/useNotes';
import { useSparks } from '../../features/sparks/hooks/useSparks';
import { useActions } from '../../features/actions/hooks/useActions';
import { usePaths } from '../../features/paths/hooks/usePaths';
import { useLoops } from '../../features/loops/hooks/useLoops';
import { useBottomSheet } from '../../app/contexts/BottomSheetContext';
import { Note } from '../../shared/types/note';
import { Spark } from '../../shared/types/spark';
import { Action } from '../../shared/types/action';
import { Path } from '../../shared/types/path';
import { Loop } from '../../shared/types/loop';
import { ENTRY_TYPES } from '../../shared/constants/entryTypes';
import { EntryType } from '../../shared/constants/entryTypes';

const { width } = Dimensions.get('window');

// Entry type icon metadata - using theme colors from entryTypes constants
const iconMap: Record<string, { iconName: IconName; iconColor: string }> = {
    note: { iconName: 'scroll-text', iconColor: ENTRY_TYPES[EntryType.NOTE].color },
    spark: { iconName: 'zap', iconColor: ENTRY_TYPES[EntryType.SPARK].color },
    action: { iconName: 'square-check', iconColor: ENTRY_TYPES[EntryType.ACTION].color },
    path: { iconName: 'compass', iconColor: ENTRY_TYPES[EntryType.PATH].color },
    loop: { iconName: 'infinity', iconColor: ENTRY_TYPES[EntryType.LOOP].color },
};


export default function HomeScreen() {
    const { theme, isDark } = useTheme();
    const { notes, loadNotes } = useNotes();
    const { sparks, loadSparks } = useSparks();
    const { actions, loadActions } = useActions();
    const { paths, loadPaths } = usePaths();
    const { loops, loadLoops } = useLoops();
    const { showNoteForm, showSparkForm, showActionForm, showPathForm } = useBottomSheet();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const headerOpacity = useSharedValue(0);
    const cardsOpacity = useSharedValue(0);
    const actionsTranslateY = useSharedValue(50);

    const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
    const cardsStyle = useAnimatedStyle(() => ({ opacity: cardsOpacity.value }));
    const actionsStyle = useAnimatedStyle(() => ({
        opacity: cardsOpacity.value,
        transform: [{ translateY: actionsTranslateY.value }],
    }));

    useEffect(() => {
        headerOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
        cardsOpacity.value = withDelay(400, withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }));
        actionsTranslateY.value = withDelay(600, withTiming(0, { duration: 800, easing: Easing.out(Easing.elastic(1)) }));
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([loadNotes(), loadSparks(), loadActions(), loadPaths(), loadLoops()]);
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        };
        loadData();
    }, [loadNotes, loadSparks, loadActions, loadPaths, loadLoops]);

    const formatRelativeDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    const navigateToEntryScreen = (type: string, id: string) => {
        switch (type) {
            case 'note':
                navigation.navigate('NoteScreen', { mode: 'view', id });
                break;
            case 'spark':
                navigation.navigate('SparkScreen', { mode: 'view', id });
                break;
            case 'action':
                navigation.navigate('ActionScreen', { mode: 'view', id });
                break;
            case 'path':
                navigation.navigate('PathScreen', { mode: 'view', id });
                break;
            case 'loop':
                navigation.navigate('LoopBuilderScreen', { mode: 'view', id });
                break;
            default:
                console.warn(`Unknown entry type: ${type}`);
        }
    };

    // Type-safe entry mappings
    const noteEntries = Array.isArray(notes)
        ? notes.map((n: Note) => ({
            id: n.id,
            type: 'note',
            title: n.title,
            date: formatRelativeDate(n.createdAt),
            ...iconMap.note
        }))
        : [];

    const sparkEntries = Array.isArray(sparks)
        ? sparks.map((s: Spark) => ({
            id: s.id,
            type: 'spark',
            title: s.title,
            date: formatRelativeDate(s.createdAt),
            ...iconMap.spark
        }))
        : [];

    const actionEntries = Array.isArray(actions)
        ? actions.map((a: Action) => ({
            id: a.id,
            type: 'action',
            title: a.title,
            date: formatRelativeDate(a.createdAt),
            ...iconMap.action
        }))
        : [];

    const pathEntries = Array.isArray(paths)
        ? paths.map((p: Path) => ({
            id: p.id,
            type: 'path',
            title: p.title,
            date: formatRelativeDate(p.createdAt),
            ...iconMap.path
        }))
        : [];

    const loopEntries = Array.isArray(loops)
        ? loops.map((l: Loop) => ({
            id: l.id,
            type: 'loop',
            title: l.title,
            date: formatRelativeDate(l.createdAt.toISOString()),
            ...iconMap.loop
        }))
        : [];

    const recentEntries = [
        ...noteEntries,
        ...sparkEntries,
        ...actionEntries,
        ...pathEntries,
        ...loopEntries,
    ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4);

    const quickActions = [
        { id: '1', title: 'New Note', icon: 'file-text', color: theme.colors.primary, onPress: () => showNoteForm() },
        { id: '2', title: 'Add Spark', icon: 'lightbulb', color: theme.colors.secondary, onPress: () => showSparkForm() },
        { id: '3', title: 'Create Action', icon: 'check', color: theme.colors.success, onPress: () => showActionForm() },
        { id: '4', title: 'Start Path', icon: 'compass', color: theme.colors.textSecondary, onPress: () => showPathForm() },
        { id: '5', title: 'Create Loop', icon: 'infinity', color: ENTRY_TYPES[EntryType.LOOP].color, onPress: () => navigation.navigate('LoopBuilderScreen', { mode: 'create' }) },
        { id: '6', title: 'UI Showcase', icon: 'layout-grid', color: theme.colors.primaryLight, onPress: () => navigation.navigate('ComponentShowcaseScreen') },
        { id: '7', title: 'Path Timeline', icon: 'git-branch', color: theme.colors.secondaryLight, onPress: () => navigation.navigate('TestScreen') },
    ];


    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        content: { padding: theme.spacing.m },
        header: { marginBottom: theme.spacing.l },
        sectionTitle: { marginTop: theme.spacing.xl, marginBottom: theme.spacing.m, color: theme.colors.textPrimary },
        cardList: { marginBottom: theme.spacing.m },
        entryCard: { marginBottom: theme.spacing.m, borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
        entryMeta: { fontSize: theme.typography.fontSize.s, color: theme.colors.textSecondary },
        quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: -theme.spacing.xs },
        actionCard: { width: (width - theme.spacing.m * 2 - theme.spacing.xs * 2) / 2, padding: theme.spacing.m, marginHorizontal: theme.spacing.xs, marginBottom: theme.spacing.m, alignItems: 'center', borderRadius: theme.shape.radius.m },
        actionIcon: { marginBottom: theme.spacing.s, padding: theme.spacing.s, borderRadius: theme.shape.radius.circle, backgroundColor: theme.colors.scrim },
        actionTitle: { color: theme.colors.onPrimary, fontWeight: theme.typography.fontWeight.medium, textAlign: 'center' },
        welcomeMessage: { marginTop: theme.spacing.s, color: theme.colors.textSecondary },
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background}
            />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View style={[styles.header, headerStyle]}>
                    <Typography variant="h1">MindKnot</Typography>
                    <Typography variant="body1" style={styles.welcomeMessage}>
                        Connect your thoughts and narratives
                    </Typography>
                </Animated.View>

                {/* Recent Entries */}
                <Animated.View style={cardsStyle}>
                    <Typography variant="h2" style={styles.sectionTitle}>Recent Entries</Typography>
                    <View style={styles.cardList}>
                        {recentEntries.map((entry) => (
                            <TouchableOpacity
                                key={entry.id}
                                style={styles.entryCard}
                                activeOpacity={0.8}
                                onPress={() => navigateToEntryScreen(entry.type, entry.id)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Icon
                                        name={entry.iconName as IconName}
                                        width={20}
                                        height={20}
                                        color={entry.iconColor}
                                        style={{ marginRight: theme.spacing.s }}
                                    />
                                    <Typography variant="h3">{entry.title}</Typography>
                                </View>
                                <Typography variant="caption" style={styles.entryMeta}>
                                    {entry.date}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View style={actionsStyle}>
                    <Typography variant="h2" style={styles.sectionTitle}>Quick Actions</Typography>
                    <View style={styles.quickActionsContainer}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={[styles.actionCard, { backgroundColor: action.color }]}
                                onPress={() => action.onPress()}
                                activeOpacity={0.8}
                            >
                                <View style={styles.actionIcon}>
                                    <Icon
                                        name={action.icon as IconName}
                                        width={24}
                                        height={24}
                                        color={theme.colors.onPrimary}
                                    />
                                </View>
                                <Typography style={styles.actionTitle}>{action.title}</Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );

}
