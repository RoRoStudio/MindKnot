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

interface HomeScreenProps {
    navigation: NavigationProp<ParamListBase>;
}

// Sample data for recent entries
const recentEntries = [
    { id: '1', title: 'Morning Reflection', type: 'reflection', date: 'Today, 9:15 AM', saga: 'Personal Growth' },
    { id: '2', title: 'Weekly Plan', type: 'action', date: 'Yesterday, 7:30 PM', saga: 'Startup Journey' },
    { id: '3', title: 'New Product Idea', type: 'idea', date: '2 days ago', saga: 'Startup Journey' },
    { id: '4', title: 'Exercise Log', type: 'note', date: '3 days ago', saga: 'Health & Fitness' },
];

// Sample data for quick actions
const quickActions = [
    { id: '1', title: 'New Reflection', icon: 'sparkles', color: '#8A4FFB' },
    { id: '2', title: 'Add Task', icon: 'check', color: '#2D9CDB' },
    { id: '3', title: 'Capture Idea', icon: 'lightbulb', color: '#FFB800' },
    { id: '4', title: 'Write Note', icon: 'file-text', color: '#27AE60' },
];

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const { theme, isDark } = useTheme();

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
    const getEntryTypeIcon = (type: string) => {
        switch (type) {
            case 'reflection': return 'sparkles';
            case 'action': return 'check';
            case 'idea': return 'lightbulb';
            case 'note': return 'file-text';
            default: return 'file-text';
        }
    };

    // Navigate to a saga
    const navigateToSaga = () => {
        navigation.navigate('Sagas');
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
                        {recentEntries.map(entry => (
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
                        ))}
                    </View>
                </Animated.View>

                {/* Quick Actions Section */}
                <Animated.View style={actionsStyle}>
                    <Typography variant="h2" style={styles.sectionTitle}>Quick Actions</Typography>

                    <View style={styles.quickActionsContainer}>
                        {quickActions.map(action => (
                            <TouchableOpacity
                                key={action.id}
                                style={[
                                    styles.actionCard,
                                    { backgroundColor: action.color }
                                ]}
                                onPress={() => console.log(`Action ${action.title}`)}
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