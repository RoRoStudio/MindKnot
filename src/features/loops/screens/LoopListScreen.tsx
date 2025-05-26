/**
 * LoopListScreen
 * 
 * Main screen for displaying and managing loops.
 * Provides filtering, search, and creation capabilities.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    FilterableList,
    Typography,
    Button,
    Card
} from '../../../shared/components';
import { Loop, LoopFilters } from '../../../shared/types/loop';
import { LoopCard } from '../components/LoopCard';
import { LoopFiltersModal } from '../components/LoopFiltersModal';
import { useLoops } from '../hooks/useLoops';
import { ExecutionEngine } from '../services/ExecutionEngine';

export interface LoopListScreenProps {
    navigation: any;
}

export const LoopListScreen: React.FC<LoopListScreenProps> = ({ navigation }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [currentExecution, setCurrentExecution] = useState<any>(null);

    const {
        loops,
        isLoading,
        error,
        loadLoops,
        deleteLoop,
        allTags,
    } = useLoops();

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        emptyText: {
            textAlign: 'center',
            marginTop: theme.spacing.m,
            marginBottom: theme.spacing.xl,
        },
        executionBanner: {
            margin: theme.spacing.m,
            padding: theme.spacing.m,
            backgroundColor: theme.colors.primary,
            borderRadius: theme.shape.radius.m,
        },
        executionText: {
            color: theme.colors.onPrimary,
            textAlign: 'center',
        },
        createButton: {
            margin: theme.spacing.m,
        },
    }));

    // Load loops on screen focus
    useFocusEffect(
        useCallback(() => {
            loadLoops();
            checkCurrentExecution();
        }, [])
    );

    // Check for current execution
    const checkCurrentExecution = useCallback(async () => {
        try {
            const executionEngine = ExecutionEngine.getInstance();
            const execution = executionEngine.getCurrentExecution();
            setCurrentExecution(execution);
        } catch (error) {
            console.error('Failed to check current execution:', error);
        }
    }, []);

    // Filter loops based on search and filters
    const filteredLoops = React.useMemo(() => {
        let filtered = [...loops];

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(loop =>
                loop.title.toLowerCase().includes(searchLower) ||
                loop.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        // Apply tag filter
        if (selectedTags.length > 0) {
            filtered = filtered.filter(loop =>
                selectedTags.every(tag => loop.tags.includes(tag))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [loops, searchTerm, selectedTags, sortOrder]);

    const handleCreateLoop = useCallback(() => {
        navigation.navigate('LoopBuilder');
    }, [navigation]);

    const handleLoopPress = useCallback((loop: Loop) => {
        navigation.navigate('LoopDetail', { loopId: loop.id });
    }, [navigation]);

    const handleEditLoop = useCallback((loop: Loop) => {
        navigation.navigate('LoopBuilder', { loopId: loop.id });
    }, [navigation]);

    const handleDeleteLoop = useCallback(async (loop: Loop) => {
        Alert.alert(
            'Delete Loop',
            `Are you sure you want to delete "${loop.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteLoop(loop.id);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete loop. Please try again.');
                        }
                    },
                },
            ]
        );
    }, [deleteLoop]);

    const handleStartLoop = useCallback(async (loop: Loop) => {
        try {
            const executionEngine = ExecutionEngine.getInstance();
            await executionEngine.startLoop(loop);
            navigation.navigate('LoopExecution', { loopId: loop.id });
        } catch (error) {
            console.error('Failed to start loop:', error);
            Alert.alert('Error', 'Failed to start loop. Please try again.');
        }
    }, [navigation]);

    const handleResumeExecution = useCallback(() => {
        if (currentExecution) {
            navigation.navigate('LoopExecution', { loopId: currentExecution.loopId });
        }
    }, [currentExecution, navigation]);

    const handleToggleTag = useCallback((tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    }, []);

    const renderLoopItem = useCallback(({ item }: { item: Loop }) => (
        <LoopCard
            loop={item}
            onPress={() => handleLoopPress(item)}
            onEdit={() => handleEditLoop(item)}
            onDelete={() => handleDeleteLoop(item)}
            onStart={() => handleStartLoop(item)}
            showExecutionButton={!currentExecution}
        />
    ), [handleLoopPress, handleEditLoop, handleDeleteLoop, handleStartLoop, currentExecution]);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Typography variant="h2" color="secondary" style={styles.emptyText}>
                No loops yet
            </Typography>
            <Typography variant="body1" color="secondary" style={styles.emptyText}>
                Create your first loop to get started with structured activities and routines.
            </Typography>
            <Button
                variant="primary"
                label="Create Your First Loop"
                leftIcon="plus"
                onPress={handleCreateLoop}
                style={styles.createButton}
            />
        </View>
    );

    const renderCurrentExecution = () => {
        if (!currentExecution) return null;

        return (
            <Card style={styles.executionBanner} onPress={handleResumeExecution}>
                <Typography variant="body1" style={styles.executionText}>
                    Loop in progress - Tap to resume
                </Typography>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            {renderCurrentExecution()}

            <FilterableList
                data={filteredLoops}
                loadData={loadLoops}
                renderItem={renderLoopItem}
                emptyIcon="repeat"
                emptyText="No loops found"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                allTags={allTags}
                selectedTags={selectedTags}
                onToggleTag={handleToggleTag}
                isLoading={isLoading}
                ListEmptyComponent={filteredLoops.length === 0 && loops.length === 0 ? renderEmptyState : undefined}
            />

            <LoopFiltersModal
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                filters={{
                    query: searchTerm,
                    tags: selectedTags,
                    sortBy: sortOrder === 'alphabetical' ? 'title' : 'createdAt',
                    sortDirection: sortOrder === 'oldest' ? 'asc' : 'desc',
                }}
                onFiltersChange={(filters) => {
                    setSearchTerm(filters.query || '');
                    setSelectedTags(filters.tags || []);
                    if (filters.sortBy === 'name') {
                        setSortOrder('alphabetical');
                    } else {
                        setSortOrder(filters.sortDirection === 'asc' ? 'oldest' : 'newest');
                    }
                }}
                allTags={allTags}
            />
        </View>
    );
}; 