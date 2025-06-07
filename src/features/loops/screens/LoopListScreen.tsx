/**
 * LoopListScreen - Beautifully designed loop management screen
 * Features modern card design with proper theme adherence
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Typography } from '../../../shared/components/Typography';
import { Icon } from '../../../shared/components/Icon';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { RootState } from '../../../app/store';
import { fetchLoops, searchLoops, filterLoops } from '../store/loopSlice';
import { Loop } from '../types';
import { RootStackParamList } from '../../../app/navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ViewMode = 'grid' | 'list';

export default function LoopListScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigation = useNavigation<NavigationProp>();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Animations
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const searchOpacity = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Redux state
    const { loops, isLoading, error } = useSelector((state: RootState) => state.loops);

    // Filtered loops
    const filteredLoops = loops.filter(loop => {
        const matchesSearch = loop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loop.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0 ||
            selectedTags.some(tag => loop.tags.includes(tag));
        return matchesSearch && matchesTags;
    });

    // Get all available tags
    const allTags = Array.from(new Set(loops.flatMap(loop => loop.tags)));

    useEffect(() => {
        // Initial load
        dispatch(fetchLoops());

        // Entrance animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [dispatch]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await dispatch(fetchLoops());
        setIsRefreshing(false);
    };

    const handleLoopPress = (loop: Loop) => {
        navigation.navigate('LoopDetailsScreen', { loopId: loop.id });
    };

    const handleExecuteLoop = (loop: Loop) => {
        navigation.navigate('LoopExecutionScreen', { loopId: loop.id });
    };

    const handleCreateLoop = () => {
        navigation.navigate('LoopBuilderScreen');
    };

    const handleTagFilter = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const formatDuration = (minutes: number): string => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    };

    const getLoopStats = (loop: Loop) => {
        const activityCount = loop.activities.length;
        const totalDuration = loop.activities.reduce((sum, activity) => sum + activity.estimatedDuration, 0);
        const subItemCount = loop.activities.reduce((sum, activity) => sum + (activity.subItems?.length || 0), 0);

        return { activityCount, totalDuration, subItemCount };
    };

    const renderLoopCard = ({ item: loop, index }: { item: Loop; index: number }) => {
        const { activityCount, totalDuration, subItemCount } = getLoopStats(loop);
        const isGrid = viewMode === 'grid';

        return (
            <Animated.View
                style={[
                    styles.loopCard,
                    isGrid ? styles.gridCard : styles.listCard,
                    {
                        opacity: fadeAnim,
                        transform: [{
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                            })
                        }]
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => handleLoopPress(loop)}
                    activeOpacity={0.7}
                >
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                        <View style={styles.loopIconContainer}>
                            <Icon name="zap" size={24} color={theme.colors.onPrimary} />
                        </View>

                        <View style={styles.cardHeaderContent}>
                            <Typography style={styles.loopTitle} numberOfLines={2}>
                                {loop.title}
                            </Typography>

                            {loop.description && (
                                <Typography style={styles.loopDescription} numberOfLines={isGrid ? 2 : 1}>
                                    {loop.description}
                                </Typography>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.executeButton}
                            onPress={() => handleExecuteLoop(loop)}
                        >
                            <Icon name="circle-play" size={20} color={theme.colors.onSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Icon name="list" size={14} color={theme.colors.textSecondary} />
                            <Typography style={styles.statText}>
                                {activityCount}
                            </Typography>
                        </View>

                        <View style={styles.statItem}>
                            <Icon name="clock-3" size={14} color={theme.colors.textSecondary} />
                            <Typography style={styles.statText}>
                                {formatDuration(totalDuration)}
                            </Typography>
                        </View>

                        {subItemCount > 0 && (
                            <View style={styles.statItem}>
                                <Icon name="check-square" size={14} color={theme.colors.textSecondary} />
                                <Typography style={styles.statText}>
                                    {subItemCount}
                                </Typography>
                            </View>
                        )}
                    </View>

                    {/* Tags */}
                    {loop.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {loop.tags.slice(0, isGrid ? 2 : 3).map((tag, tagIndex) => (
                                <View key={tagIndex} style={styles.tag}>
                                    <Typography style={styles.tagText}>
                                        {tag}
                                    </Typography>
                                </View>
                            ))}
                            {loop.tags.length > (isGrid ? 2 : 3) && (
                                <View style={styles.moreTagsIndicator}>
                                    <Typography style={styles.moreTagsText}>
                                        +{loop.tags.length - (isGrid ? 2 : 3)}
                                    </Typography>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Last executed */}
                    <View style={styles.cardFooter}>
                        <Typography style={styles.lastExecuted}>
                            Modified {new Date(loop.updatedAt).toLocaleDateString()}
                        </Typography>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderTagFilter = ({ item: tag }: { item: string }) => {
        const isSelected = selectedTags.includes(tag);

        return (
            <TouchableOpacity
                style={[
                    styles.filterTag,
                    isSelected && styles.filterTagSelected
                ]}
                onPress={() => handleTagFilter(tag)}
            >
                <Typography style={[
                    styles.filterTagText,
                    isSelected && styles.filterTagTextSelected
                ]}>
                    {tag}
                </Typography>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Icon name="zap" size={64} color={theme.colors.textSecondary} />
            </View>
            <Typography style={styles.emptyTitle}>
                {searchQuery ? 'No loops found' : 'No loops yet'}
            </Typography>
            <Typography style={styles.emptyDescription}>
                {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Create your first loop to get started with structured activities'
                }
            </Typography>
            {!searchQuery && (
                <TouchableOpacity style={styles.createFirstButton} onPress={handleCreateLoop}>
                    <Typography style={styles.createFirstButtonText}>
                        Create Your First Loop
                    </Typography>
                </TouchableOpacity>
            )}
        </View>
    );

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
            marginBottom: 20,
        },
        welcomeSection: {
            flex: 1,
        },
        welcomeText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginBottom: 4,
        },
        pageTitle: {
            fontSize: 32,
            fontWeight: '800' as const,
            color: theme.colors.textPrimary,
            letterSpacing: -0.5,
        },
        headerActions: {
            flexDirection: 'row' as const,
            gap: 12,
        },
        headerButton: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.surface,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            ...theme.elevation.xs,
        },
        createButton: {
            backgroundColor: theme.colors.primary,
        },
        searchContainer: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 16,
            ...theme.shadows.small,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: theme.colors.textPrimary,
            marginLeft: 12,
        },
        viewToggle: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 16,
            padding: 4,
            marginBottom: 16,
        },
        viewToggleButton: {
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 12,
            alignItems: 'center' as const,
        },
        viewToggleButtonActive: {
            backgroundColor: theme.colors.primary,
        },
        viewToggleText: {
            fontSize: 14,
            fontWeight: '500' as const,
            color: theme.colors.textSecondary,
        },
        viewToggleTextActive: {
            color: theme.colors.onPrimary,
        },
        filterSection: {
            marginBottom: 16,
        },
        filterTitle: {
            fontSize: 16,
            fontWeight: '600' as const,
            color: theme.colors.textPrimary,
            marginBottom: 12,
        },
        filterScrollView: {
            paddingRight: 24,
        },
        filterTag: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 20,
            marginRight: 8,
        },
        filterTagSelected: {
            backgroundColor: theme.colors.primary,
        },
        filterTagText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: '500' as const,
        },
        filterTagTextSelected: {
            color: theme.colors.onPrimary,
        },
        content: {
            flex: 1,
            paddingHorizontal: 24,
        },
        // Loop cards
        loopCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 28,
            marginBottom: 16,
            overflow: 'hidden' as const,
            ...theme.shadows.medium,
        },
        listCard: {
            // Full width for list view
        },
        gridCard: {
            width: (SCREEN_WIDTH - 72) / 2, // Account for padding and gap
            marginRight: 16,
        },
        cardContent: {
            padding: 20,
        },
        cardHeader: {
            flexDirection: 'row' as const,
            alignItems: 'flex-start' as const,
            marginBottom: 16,
        },
        loopIconContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.primary,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginRight: 16,
            ...theme.shadows.small,
        },
        cardHeaderContent: {
            flex: 1,
        },
        loopTitle: {
            fontSize: 18,
            fontWeight: '700' as const,
            color: theme.colors.textPrimary,
            marginBottom: 4,
            lineHeight: 24,
        },
        loopDescription: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
        },
        executeButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.secondary,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            ...theme.shadows.small,
        },
        statsContainer: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 16,
            marginBottom: 16,
        },
        statItem: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: 6,
        },
        statText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: '500' as const,
        },
        tagsContainer: {
            flexDirection: 'row' as const,
            flexWrap: 'wrap' as const,
            gap: 8,
            marginBottom: 16,
        },
        tag: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: theme.colors.primaryContainer,
            borderRadius: 16,
        },
        tagText: {
            fontSize: 12,
            color: theme.colors.onPrimaryContainer,
            fontWeight: '500' as const,
        },
        moreTagsIndicator: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 16,
        },
        moreTagsText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            fontWeight: '500' as const,
        },
        cardFooter: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline + '20',
            paddingTop: 12,
            marginTop: 4,
        },
        lastExecuted: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        // Empty state
        emptyContainer: {
            flex: 1,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            paddingHorizontal: 32,
        },
        emptyIconContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.surfaceVariant,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginBottom: 24,
        },
        emptyTitle: {
            fontSize: 24,
            fontWeight: '700' as const,
            color: theme.colors.textPrimary,
            marginBottom: 12,
            textAlign: 'center' as const,
        },
        emptyDescription: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center' as const,
            lineHeight: 24,
            marginBottom: 32,
        },
        createFirstButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 28,
            ...theme.shadows.medium,
        },
        createFirstButtonText: {
            fontSize: 16,
            fontWeight: '600' as const,
            color: theme.colors.onPrimary,
        },
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            {/* Header */}
            <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                <View style={styles.headerTop}>
                    <View style={styles.welcomeSection}>
                        <Typography style={styles.welcomeText}>
                            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
                        </Typography>
                        <Typography style={styles.pageTitle}>
                            My Loops
                        </Typography>
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerButton}>
                            <Icon name="settings" size={20} color={theme.colors.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.headerButton, styles.createButton]}
                            onPress={handleCreateLoop}
                        >
                            <Icon name="plus" size={20} color={theme.colors.onPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search loops..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="x" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* View Toggle */}
                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[
                            styles.viewToggleButton,
                            viewMode === 'list' && styles.viewToggleButtonActive
                        ]}
                        onPress={() => setViewMode('list')}
                    >
                        <Typography style={[
                            styles.viewToggleText,
                            viewMode === 'list' && styles.viewToggleTextActive
                        ]}>
                            List
                        </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.viewToggleButton,
                            viewMode === 'grid' && styles.viewToggleButtonActive
                        ]}
                        onPress={() => setViewMode('grid')}
                    >
                        <Typography style={[
                            styles.viewToggleText,
                            viewMode === 'grid' && styles.viewToggleTextActive
                        ]}>
                            Grid
                        </Typography>
                    </TouchableOpacity>
                </View>

                {/* Tag Filters */}
                {allTags.length > 0 && (
                    <View style={styles.filterSection}>
                        <Typography style={styles.filterTitle}>
                            Filter by tags
                        </Typography>
                        <FlatList
                            horizontal
                            data={allTags}
                            renderItem={renderTagFilter}
                            keyExtractor={(item) => item}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterScrollView}
                        />
                    </View>
                )}
            </Animated.View>

            {/* Content */}
            <View style={styles.content}>
                {filteredLoops.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <FlatList
                        data={filteredLoops}
                        renderItem={renderLoopCard}
                        keyExtractor={(item) => item.id}
                        numColumns={viewMode === 'grid' ? 2 : 1}
                        key={viewMode} // Force re-render when view mode changes
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor={theme.colors.primary}
                            />
                        }
                        contentContainerStyle={{
                            paddingBottom: 100,
                        }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
} 