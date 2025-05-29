/**
 * LoopListScreen - Loop Management Screen
 * Following BaseEntityScreen pattern with EntryDetailHeader and EntryMetadataBar
 * 
 * Features:
 * - Search, filter, sort functionality
 * - Grid/list view toggle
 * - Active session indicator
 * - Basic loop management (create, edit, delete)
 * - Quick execution start
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../app/contexts/ThemeContext';
import {
    BaseEntityScreen,
    EntryDetailHeader,
    EntryMetadataBar,
} from '../../../shared/components';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { LoopCard } from '../components/LoopCard';
import { useLoops } from '../hooks/useLoops';
import { useActivityTemplates } from '../hooks/useActivityTemplates';
import { RootStackParamList } from '../../../shared/types/navigation';
import { Loop } from '../../../shared/types/loop';
import { logLoop, logNavigation } from '../../../shared/utils/debugLogger';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoopListScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { loops, isLoading, loadLoops, deleteLoop } = useLoops();
    const { templates } = useActivityTemplates();

    // Filter and search state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [isGridView, setIsGridView] = useState(false);

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
    }));

    // Load loops when screen focuses
    useFocusEffect(
        useCallback(() => {
            logLoop('Screen focused, loading loops');
            loadLoops();
        }, [loadLoops])
    );

    // Debug: Log loops when they change
    useEffect(() => {
        logLoop(`Loops loaded: ${loops.length} loops available`, undefined,
            loops.map(l => ({ id: l.id, title: l.title })));
    }, [loops]);

    // Get all unique tags from loops
    const allTags = React.useMemo(() => {
        const tagSet = new Set<string>();
        loops.forEach(loop => {
            loop.tags.forEach(tag => tagSet.add(tag));
        });
        logLoop(`Found ${tagSet.size} unique tags`, undefined, Array.from(tagSet));
        return Array.from(tagSet).sort();
    }, [loops]);

    // Filter and sort loops
    const filteredLoops = React.useMemo(() => {
        logLoop('Filtering loops', undefined, {
            searchTerm,
            selectedTags,
            categoryId,
            sortOrder
        });

        let filtered = loops.filter(loop => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = loop.title.toLowerCase().includes(searchLower) ||
                    (loop.description?.toLowerCase().includes(searchLower) || false);
                if (!matchesSearch) return false;
            }

            // Category filter
            if (categoryId && loop.categoryId !== categoryId) {
                return false;
            }

            // Tags filter
            if (selectedTags.length > 0) {
                const hasSelectedTag = selectedTags.some(tag => loop.tags.includes(tag));
                if (!hasSelectedTag) return false;
            }

            return true;
        });

        // Sort filtered loops
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                case 'oldest':
                    return a.createdAt.getTime() - b.createdAt.getTime();
                case 'newest':
                default:
                    return b.createdAt.getTime() - a.createdAt.getTime();
            }
        });

        logLoop(`Filtered to ${filtered.length} loops`);
        return filtered;
    }, [loops, searchTerm, selectedTags, categoryId, sortOrder]);

    // Navigation handlers
    const handleCreateLoop = () => {
        logNavigation('LoopBuilderScreen', { mode: 'create' });
        navigation.navigate('LoopBuilderScreen', {
            mode: 'create'
        });
    };

    const handleViewLoop = (loop: Loop) => {
        logLoop('Navigating to loop details', loop.id, { title: loop.title });
        logNavigation('LoopDetailsScreen', { loopId: loop.id });

        navigation.navigate('LoopDetailsScreen', {
            loopId: loop.id
        });
    };

    const handleEditLoop = (loop: Loop) => {
        logLoop('Navigating to edit loop', loop.id, { title: loop.title });
        logNavigation('LoopBuilderScreen', { mode: 'edit', id: loop.id });

        navigation.navigate('LoopBuilderScreen', {
            mode: 'edit',
            id: loop.id
        });
    };

    const handleExecuteLoop = (loop: Loop) => {
        logLoop('Navigating to execute loop', loop.id, { title: loop.title });
        logNavigation('LoopExecutionScreen', { loopId: loop.id });

        navigation.navigate('LoopExecutionScreen', {
            loopId: loop.id
        });
    };

    const handleDuplicateLoop = async (loop: Loop) => {
        logLoop('Attempting to duplicate loop', loop.id, { title: loop.title });
        try {
            // TODO: Implement duplicate functionality
            Alert.alert('Feature Coming Soon', 'Loop duplication will be available in a future update.');
        } catch (error) {
            logLoop('Error duplicating loop', loop.id, error);
            Alert.alert('Error', 'Failed to duplicate loop');
        }
    };

    const handleDeleteLoop = (loop: Loop) => {
        logLoop('Requesting loop deletion', loop.id, { title: loop.title });

        Alert.alert(
            'Delete Loop',
            `Are you sure you want to delete "${loop.title}"? This action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            logLoop('Deleting loop', loop.id);
                            const success = await deleteLoop(loop.id);
                            if (success) {
                                logLoop('Loop deleted successfully', loop.id);
                                await loadLoops(); // Refresh the list
                            } else {
                                logLoop('Failed to delete loop', loop.id);
                                Alert.alert('Error', 'Failed to delete loop');
                            }
                        } catch (error) {
                            logLoop('Error deleting loop', loop.id, error);
                            Alert.alert('Error', 'An error occurred while deleting the loop');
                        }
                    },
                },
            ]
        );
    };

    // Render loop item
    const renderLoopItem = ({ item }: { item: Loop }) => {
        logLoop('Rendering loop item', item.id, { title: item.title });

        return (
            <LoopCard
                loop={item}
                templates={templates}
                isGridView={isGridView}
                onPress={() => handleViewLoop(item)}
                onEdit={() => handleEditLoop(item)}
                onExecute={() => handleExecuteLoop(item)}
                onDuplicate={() => handleDuplicateLoop(item)}
                onDelete={() => handleDeleteLoop(item)}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <EntryDetailHeader
                entryType="Loops"
                onBackPress={() => navigation.goBack()}
                isSaved={true}
            />

            {/* Metadata Bar for filtering */}
            <EntryMetadataBar
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                labels={selectedTags}
                onLabelsChange={setSelectedTags}
                isEditing={true}
            />

            {/* Main Content */}
            <BaseEntityScreen
                data={filteredLoops.map(loop => ({
                    ...loop,
                    createdAt: loop.createdAt.getTime(),
                    updatedAt: loop.updatedAt.getTime(),
                }))}
                loadData={loadLoops}
                renderItem={({ item }: { item: any }) => renderLoopItem({ item: item as Loop })}
                onCreateEntity={handleCreateLoop}
                createButtonLabel="Create Loop"
                emptyIcon="repeat"
                emptyText="No loops yet. Create your first loop to get started!"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                allTags={allTags}
                selectedTags={selectedTags}
                onToggleTag={(tag: string) => {
                    setSelectedTags(prev =>
                        prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                    );
                }}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                isGridView={isGridView}
                onToggleView={() => setIsGridView(prev => !prev)}
                isLoading={isLoading}
            />
        </SafeAreaView>
    );
} 