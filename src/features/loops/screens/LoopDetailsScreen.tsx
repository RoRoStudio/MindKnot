/**
 * LoopDetailsScreen - Elegant and refined loop details interface
 * Features sophisticated visual hierarchy and modern design patterns
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    Animated,
    RefreshControl,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Typography } from '../../../shared/components/Typography';
import { Icon } from '../../../shared/components/Icon';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { RootState } from '../../../app/store';
import { deleteLoop, duplicateLoop } from '../store/loopSlice';
import { Loop, ActivityInstance } from '../types';
import { RootStackParamList } from '../../../app/navigation/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type LoopDetailsRouteProp = RouteProp<{
    LoopDetailsScreen: {
        loopId: string;
    };
}, 'LoopDetailsScreen'>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoopDetailsScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<LoopDetailsRouteProp>();
    const { loopId } = route.params;

    // State
    const [isLoading, setIsLoading] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const heroScale = useRef(new Animated.Value(0.95)).current;

    // Redux state
    const loop = useSelector((state: RootState) =>
        state.loops.loops.find(l => l.id === loopId)
    );

    useEffect(() => {
        if (loop) {
            // Sophisticated entrance animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(heroScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [loop]);

    const loadLoopData = async () => {
        setIsLoading(true);
        // Simulate loading for refresh
        setTimeout(() => setIsLoading(false), 500);
    };

    const handleExecuteLoop = () => {
        navigation.navigate('LoopExecutionScreen', { loopId });
    };

    const handleEditLoop = () => {
        navigation.navigate('LoopBuilderScreen', { loopId });
    };

    const handleDeleteLoop = () => {
        Alert.alert(
            'Delete Loop',
            `Are you sure you want to delete "${loop?.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(deleteLoop(loopId));
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleDuplicateLoop = () => {
        Alert.alert(
            'Duplicate Loop',
            `Create a copy of "${loop?.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Duplicate',
                    onPress: () => {
                        dispatch(duplicateLoop(loopId));
                        Alert.alert('Success', 'Loop duplicated successfully');
                    },
                },
            ]
        );
    };

    const formatDuration = (minutes: number): string => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    const getLoopStats = () => {
        if (!loop) return { activityCount: 0, totalDuration: 0, subItemCount: 0 };

        const activityCount = loop.activities.length;
        const totalDuration = loop.activities.reduce((sum, activity) => sum + activity.estimatedDuration, 0);
        const subItemCount = loop.activities.reduce((sum, activity) => sum + (activity.subItems?.length || 0), 0);

        return { activityCount, totalDuration, subItemCount };
    };

    // Define styles first
    const styles = {
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 8,
            backgroundColor: theme.colors.background,
        },
        headerTop: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
        },
        backButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.surface,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            ...theme.elevation.xs,
        },
        loopTitle: {
            fontSize: 20,
            fontWeight: '700' as const,
            color: theme.colors.textPrimary,
            flex: 1,
            textAlign: 'center' as const,
            marginHorizontal: 16,
        },
        headerActions: {
            flexDirection: 'row' as const,
            gap: 8,
        },
        actionButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            ...theme.elevation.xs,
        },
        secondaryActionButton: {
            backgroundColor: theme.colors.surfaceVariant,
        },
        primaryActionButton: {
            backgroundColor: theme.colors.primary,
        },
        content: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 120, // Space for action buttons
        },
        heroSection: {
            paddingHorizontal: 24,
            paddingVertical: 32,
            alignItems: 'center' as const,
        },
        loopIcon: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.colors.primary,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginBottom: 24,
            ...theme.elevation.xl,
        },
        loopDescription: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center' as const,
            lineHeight: 24,
            marginBottom: 32,
            paddingHorizontal: 16,
        },
        statsRow: {
            flexDirection: 'row' as const,
            width: '100%',
            justifyContent: 'space-around' as const,
        },
        statItem: {
            alignItems: 'center' as const,
        },
        statValue: {
            fontSize: 28,
            fontWeight: '800' as const,
            color: theme.colors.primary,
            marginBottom: 4,
        },
        statLabel: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: '500' as const,
            textTransform: 'uppercase' as const,
            letterSpacing: 0.5,
        },
        sectionCard: {
            backgroundColor: theme.colors.surface,
            marginHorizontal: 24,
            marginBottom: 20,
            borderRadius: 28,
            overflow: 'hidden' as const,
            ...theme.elevation.m,
        },
        sectionHeader: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            paddingHorizontal: 24,
            paddingVertical: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline + '20',
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '700' as const,
            color: theme.colors.textPrimary,
        },
        sectionIcon: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.surfaceVariant,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },
        activitiesList: {
            padding: 24,
        },
        activityItem: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            paddingVertical: 16,
            paddingHorizontal: 20,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 20,
            marginBottom: 12,
        },
        activityIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.primary,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginRight: 16,
        },
        activityNumber: {
            fontSize: 16,
            fontWeight: '700' as const,
            color: theme.colors.onPrimary,
        },
        activityContent: {
            flex: 1,
        },
        activityTitle: {
            fontSize: 16,
            fontWeight: '600' as const,
            color: theme.colors.textPrimary,
            marginBottom: 4,
        },
        activityMeta: {
            flexDirection: 'row' as const,
            gap: 16,
        },
        activityMetaItem: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 4,
        },
        activityMetaText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        activityIndicator: {
            marginLeft: 8,
        },
        emptyActivitiesContainer: {
            alignItems: 'center' as const,
            paddingVertical: 48,
        },
        emptyActivitiesText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginTop: 16,
        },
        metadataSection: {
            marginBottom: 20,
        },
        metadataLabel: {
            fontSize: 14,
            fontWeight: '600' as const,
            color: theme.colors.textSecondary,
            marginBottom: 8,
            textTransform: 'uppercase' as const,
            letterSpacing: 0.5,
        },
        tagContainer: {
            flexDirection: 'row' as const,
            flexWrap: 'wrap' as const,
            gap: 8,
        },
        tag: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: theme.colors.primaryContainer,
            borderRadius: 20,
        },
        tagText: {
            fontSize: 14,
            color: theme.colors.onPrimaryContainer,
            fontWeight: '500' as const,
        },
        metadataRow: {
            flexDirection: 'row' as const,
            justifyContent: 'space-between' as const,
            alignItems: 'center' as const,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline + '10',
        },
        metadataValue: {
            fontSize: 16,
            color: theme.colors.textPrimary,
            fontWeight: '500' as const,
        },
        actionsContainer: {
            position: 'absolute' as const,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 34, // Safe area
            gap: 12,
            ...theme.elevation.xl,
        },
        primaryButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: 16,
            borderRadius: 28,
            alignItems: 'center' as const,
            ...theme.elevation.m,
        },
        primaryButtonText: {
            fontSize: 16,
            fontWeight: '600' as const,
            color: theme.colors.onPrimary,
        },
        secondaryButton: {
            backgroundColor: theme.colors.surfaceVariant,
            paddingVertical: 14,
            borderRadius: 28,
            alignItems: 'center' as const,
        },
        secondaryButtonText: {
            fontSize: 15,
            fontWeight: '500' as const,
            color: theme.colors.textPrimary,
        },
        destructiveButton: {
            backgroundColor: theme.colors.errorContainer,
            paddingVertical: 14,
            borderRadius: 28,
            alignItems: 'center' as const,
        },
        destructiveButtonText: {
            fontSize: 15,
            fontWeight: '500' as const,
            color: theme.colors.onErrorContainer,
        },
        emptyStateContainer: {
            flex: 1,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            paddingHorizontal: 32,
        },
        emptyStateIconContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.errorContainer,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginBottom: 24,
        },
        emptyStateTitle: {
            fontSize: 24,
            fontWeight: '700' as const,
            color: theme.colors.textPrimary,
            marginBottom: 12,
            textAlign: 'center' as const,
        },
        emptyStateDescription: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center' as const,
            lineHeight: 24,
            marginBottom: 32,
        },
        backToListButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 28,
            ...theme.elevation.m,
        },
        backToListButtonText: {
            fontSize: 16,
            fontWeight: '600' as const,
            color: theme.colors.onPrimary,
        },
    };

    const renderActivityList = () => {
        if (!loop?.activities.length) {
            return (
                <View style={styles.emptyActivitiesContainer}>
                    <Icon name="circle-dashed" size={48} color={theme.colors.textSecondary} />
                    <Typography style={styles.emptyActivitiesText}>
                        No activities added yet
                    </Typography>
                </View>
            );
        }

        return (
            <View style={styles.activitiesList}>
                {loop.activities.map((activity, index) => (
                    <Animated.View
                        key={activity.id}
                        style={[
                            styles.activityItem,
                            {
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 30],
                                        outputRange: [0, 30 + (index * 10)],
                                    })
                                }]
                            }
                        ]}
                    >
                        <View style={styles.activityIcon}>
                            <Typography style={styles.activityNumber}>
                                {index + 1}
                            </Typography>
                        </View>

                        <View style={styles.activityContent}>
                            <Typography style={styles.activityTitle}>
                                {activity.title}
                            </Typography>

                            <View style={styles.activityMeta}>
                                <View style={styles.activityMetaItem}>
                                    <Icon name="clock-3" size={14} color={theme.colors.textSecondary} />
                                    <Typography style={styles.activityMetaText}>
                                        {formatDuration(activity.estimatedDuration)}
                                    </Typography>
                                </View>

                                {activity.subItems && activity.subItems.length > 0 && (
                                    <View style={styles.activityMetaItem}>
                                        <Icon name="check-square" size={14} color={theme.colors.textSecondary} />
                                        <Typography style={styles.activityMetaText}>
                                            {activity.subItems.length} tasks
                                        </Typography>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.activityIndicator}>
                            <Icon name="chevron-right" size={16} color={theme.colors.textSecondary} />
                        </View>
                    </Animated.View>
                ))}
            </View>
        );
    };

    // Error state
    if (!loop) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyStateContainer}>
                    <View style={styles.emptyStateIconContainer}>
                        <Icon name="circle-alert" size={64} color={theme.colors.error} />
                    </View>
                    <Typography style={styles.emptyStateTitle}>
                        Loop Not Found
                    </Typography>
                    <Typography style={styles.emptyStateDescription}>
                        The requested loop could not be found or may have been deleted.
                    </Typography>
                    <TouchableOpacity
                        style={styles.backToListButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Typography style={styles.backToListButtonText}>
                            Back to Loops
                        </Typography>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const { activityCount, totalDuration, subItemCount } = getLoopStats();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>

                    <Typography style={styles.loopTitle} numberOfLines={1}>
                        {loop.title}
                    </Typography>

                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryActionButton]}
                            onPress={handleEditLoop}
                        >
                            <Icon name="pencil" size={16} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryActionButton]}
                            onPress={handleExecuteLoop}
                        >
                            <Icon name="circle-play" size={20} color={theme.colors.onPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={loadLoopData}
                        tintColor={theme.colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Hero Section */}
                    <Animated.View
                        style={[
                            styles.heroSection,
                            { transform: [{ scale: heroScale }] }
                        ]}
                    >
                        <View style={styles.loopIcon}>
                            <Icon name="zap" size={40} color={theme.colors.onPrimary} />
                        </View>

                        {loop.description && (
                            <Typography style={styles.loopDescription}>
                                {loop.description}
                            </Typography>
                        )}

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Typography style={styles.statValue}>
                                    {activityCount}
                                </Typography>
                                <Typography style={styles.statLabel}>
                                    Activities
                                </Typography>
                            </View>
                            <View style={styles.statItem}>
                                <Typography style={styles.statValue}>
                                    {formatDuration(totalDuration)}
                                </Typography>
                                <Typography style={styles.statLabel}>
                                    Duration
                                </Typography>
                            </View>
                            <View style={styles.statItem}>
                                <Typography style={styles.statValue}>
                                    {subItemCount}
                                </Typography>
                                <Typography style={styles.statLabel}>
                                    Sub-tasks
                                </Typography>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Activities Section */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Typography style={styles.sectionTitle}>
                                Activities
                            </Typography>
                            <View style={styles.sectionIcon}>
                                <Icon name="list" size={16} color={theme.colors.textSecondary} />
                            </View>
                        </View>
                        {renderActivityList()}
                    </View>

                    {/* Metadata Section */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Typography style={styles.sectionTitle}>
                                Details
                            </Typography>
                            <View style={styles.sectionIcon}>
                                <Icon name="info" size={16} color={theme.colors.textSecondary} />
                            </View>
                        </View>

                        {/* Tags */}
                        {loop.tags.length > 0 && (
                            <View style={[styles.metadataRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                                <Typography style={styles.metadataLabel}>Tags</Typography>
                                <View style={styles.tagContainer}>
                                    {loop.tags.map((tag, index) => (
                                        <View key={index} style={styles.tag}>
                                            <Typography style={styles.tagText}>
                                                {tag}
                                            </Typography>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Metadata rows */}
                        <View style={styles.metadataRow}>
                            <Typography style={styles.metadataLabel}>Created</Typography>
                            <Typography style={styles.metadataValue}>
                                {new Date(loop.createdAt).toLocaleDateString()}
                            </Typography>
                        </View>

                        <View style={styles.metadataRow}>
                            <Typography style={styles.metadataLabel}>Last Modified</Typography>
                            <Typography style={styles.metadataValue}>
                                {new Date(loop.updatedAt).toLocaleDateString()}
                            </Typography>
                        </View>

                        {loop.categoryId && (
                            <View style={styles.metadataRow}>
                                <Typography style={styles.metadataLabel}>Category</Typography>
                                <Typography style={styles.metadataValue}>
                                    {loop.categoryId}
                                </Typography>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleExecuteLoop}>
                    <Typography style={styles.primaryButtonText}>
                        Execute Loop
                    </Typography>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleDuplicateLoop}>
                    <Typography style={styles.secondaryButtonText}>
                        Duplicate Loop
                    </Typography>
                </TouchableOpacity>

                <TouchableOpacity style={styles.destructiveButton} onPress={handleDeleteLoop}>
                    <Typography style={styles.destructiveButtonText}>
                        Delete Loop
                    </Typography>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}