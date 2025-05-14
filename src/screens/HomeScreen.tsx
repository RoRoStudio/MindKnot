// src/screens/HomeScreen.tsx
import React, { useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Icon } from '../components/common/Icon';
import { Card } from '../components/common/Card';
import { useCaptures } from '../hooks/useCaptures';
import { useLoops } from '../hooks/useLoops';
import { usePaths } from '../hooks/usePaths';
import { CaptureSubType } from '../types/capture';

interface HomeScreenProps {
    navigation: NavigationProp<ParamListBase>;
}

const { width } = Dimensions.get('window');

// Sample data for quick actions
const quickActions = [
    { id: '1', title: 'New Reflection', icon: 'sparkles', color: '#8A4FFB' },
    { id: '2', title: 'Add Task', icon: 'check', color: '#2D9CDB' },
    { id: '3', title: 'Capture Idea', icon: 'lightbulb', color: '#FFB800' },
    { id: '4', title: 'Write Note', icon: 'file-text', color: '#27AE60' },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const { theme, isDark } = useTheme();
    const { captures, loadCaptures } = useCaptures();
    const { loops, loadLoops } = useLoops();
    const { paths, loadPaths } = usePaths();

    // Animation values
    const headerOpacity = useSharedValue(0);
    const cardsOpacity = useSharedValue(0);
    const actionsTranslateY = useSharedValue(50);

    // Animation styles
    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
    }));

    const cardsStyle = useAnimatedStyle(() => ({
        opacity: cardsOpacity.value,
    }));

    const actionsStyle = useAnimatedStyle(() => ({
        opacity: cardsOpacity.value,
        transform: [{ translateY: actionsTranslateY.value }],
    }));

    // Start animations when component mounts
    useEffect(() => {
        headerOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });

        cardsOpacity.value = withDelay(
            400,
            withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
        );

        actionsTranslateY.value = withDelay(
            600,
            withTiming(0, { duration: 800, easing: Easing.out(Easing.elastic(1)) })
        );
    }, []);

    // Load data when component mounts
    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    loadCaptures(),
                    loadLoops(),
                    loadPaths()
                ]);
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };

        loadData();
    }, [loadCaptures, loadLoops, loadPaths]);

    // Format relative date for entries
    const formatRelativeDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    // Get recent entries from captures
    const recentEntries = captures
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
        .map(capture => ({
            id: capture.id,
            title: capture.title || `Untitled ${capture.subType}`,
            type: capture.subType || 'note',
            date: formatRelativeDate(capture.createdAt),
            saga: capture.sagaId ? 'Linked Saga' : 'Unlinked',
        }));

    // Define styles using theme
    const styles = StyleSheet.create({
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
            marginTop: theme.spacing.xl,
            marginBottom: theme.spacing.m,
            color: theme.colors.textPrimary,
        },
        cardList: {
            marginBottom: theme.spacing.m,
        },
        entryCard: {
            marginBottom: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
        },
        entryInfo: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing.s,
        },
        entryMeta: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        quickActionsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginHorizontal: -theme.spacing.xs,
        },
        actionCard: {
            width: (width - theme.spacing.m * 2 - theme.spacing.xs * 2) / 2,
            padding: theme.spacing.m,
            marginHorizontal: theme.spacing.xs,
            marginBottom: theme.spacing.m,
            alignItems: 'center',
            borderRadius: theme.shape.radius.m,
        },
        actionIcon: {
            marginBottom: theme.spacing.s,
            padding: theme.spacing.s,
            borderRadius: theme.shape.radius.circle,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        actionTitle: {
            color: theme.colors.white,
            fontWeight: theme.typography.fontWeight.medium,
            textAlign: 'center',
        },
        welcomeMessage: {
            marginTop: theme.spacing.s,
            color: theme.colors.textSecondary,
        }
    });

    // Get entry type icon
    const getEntryTypeIcon = (type: string): string => {
        switch (type) {
            case 'reflection': return 'sparkles';
            case 'action': return 'check';
            case 'spark': return 'lightbulb';
            case 'note': return 'file-text';
            default: return 'file-text';
        }
    };

    // Navigate to a saga
    const navigateToSaga = () => {
        // This would be updated to navigate to a specific saga once we have saga data
        navigation.navigate('Sagas');
    };

    // Quick action handlers
    const handleQuickAction = (index: number) => {
        switch (index) {
            case 0:
                navigation.navigate('Capture', { type: CaptureSubType.REFLECTION });
                break;
            case 1:
                navigation.navigate('Capture', { type: CaptureSubType.ACTION });
                break;
            case 2:
                navigation.navigate('Capture', { type: CaptureSubType.SPARK });
                break;
            case 3:
                navigation.navigate('Capture', { type: CaptureSubType.NOTE });
                break;
            default:
                break;
        }
    };

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
                {/* Header Section */}
                <Animated.View style={[styles.header, headerStyle]}>
                    <Typography variant="h1">MindKnot</Typography>
                    <Typography variant="body1" style={styles.welcomeMessage}>
                        Connect your thoughts and narratives
                    </Typography>
                </Animated.View>

                {/* Recent Entries Section */}
                <Animated.View style={cardsStyle}>
                    <Typography variant="h2" style={styles.sectionTitle}>Recent Entries</Typography>

                    <View style={styles.cardList}>
                        {recentEntries.length > 0 ? (
                            recentEntries.map((entry) => (
                                <Card
                                    key={entry.id}
                                    style={styles.entryCard}
                                    elevated
                                    onPress={() => console.log(`View entry ${entry.id}`)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon
                                            name={getEntryTypeIcon(entry.type)}
                                            width={20}
                                            height={20}
                                            color={theme.colors.primary}
                                            style={{ marginRight: theme.spacing.s }}
                                        />
                                        <Typography variant="h3">{entry.title}</Typography>
                                    </View>

                                    <View style={styles.entryInfo}>
                                        <Typography variant="caption" style={styles.entryMeta}>
                                            {entry.date}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            style={styles.entryMeta}
                                            onPress={navigateToSaga}
                                        >
                                            {entry.saga}
                                        </Typography>
                                    </View>
                                </Card>
                            ))
                        ) : (
                            <Card style={styles.entryCard}>
                                <Typography>No recent entries yet. Create your first one!</Typography>
                            </Card>
                        )}
                    </View>
                </Animated.View>

                {/* Quick Actions Section */}
                <Animated.View style={actionsStyle}>
                    <Typography variant="h2" style={styles.sectionTitle}>Quick Actions</Typography>

                    <View style={styles.quickActionsContainer}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={action.id}
                                style={[
                                    styles.actionCard,
                                    { backgroundColor: action.color }
                                ]}
                                onPress={() => handleQuickAction(index)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.actionIcon}>
                                    <Icon
                                        name={action.icon}
                                        width={24}
                                        height={24}
                                        color="#FFFFFF"
                                    />
                                </View>
                                <Typography style={styles.actionTitle}>
                                    {action.title}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}