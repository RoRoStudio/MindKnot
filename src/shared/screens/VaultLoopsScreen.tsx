// src/screens/vault/VaultLoopsScreen.tsx
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Typography } from '../components';
import { FilterableList } from '../components/FilterableList';
import { Category } from '../types/category';
import { RootStackParamList } from '../types/navigation';
import { useLoops } from '../../features/loops/hooks/useLoops';
import { useActivityTemplates } from '../../features/loops/hooks/useActivityTemplates';
import { LoopCard } from '../../features/loops/components/LoopCard';
import { Loop } from '../../shared/types/loop';
import { logLoop, logNavigation } from '../utils/debugLogger';
import { useCategories } from '../hooks/useCategories';

export default function VaultLoopsScreen() {
    const { loops, isLoading, loadLoops } = useLoops();
    const { templates } = useActivityTemplates();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { categories } = useCategories();

    // State for filtering and search
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
    const [isGridView, setIsGridView] = useState(false);

    // Load loops on mount
    useEffect(() => {
        logLoop('Component mounted, loading loops');
        loadLoops();
    }, [loadLoops]);

    // Debug: Log loops when they change
    useEffect(() => {
        logLoop(`Loops updated: ${loops.length} loops available`, undefined,
            loops.map(l => ({ id: l.id, title: l.title })));
    }, [loops]);

    // Get unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        loops.forEach(loop => {
            loop.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags);
    }, [loops]);

    // Convert categories to format expected by FilterableList
    const formattedCategories = useMemo(() => {
        return categories.map((cat: Category) => ({
            id: cat.id,
            title: cat.title,
            color: cat.color,
        }));
    }, [categories]);

    // Handle loop press
    const handleLoopPress = useCallback((loop: Loop) => {
        logNavigation('LoopDetailsScreen', { loopId: loop.id });
        navigation.navigate('LoopDetailsScreen', { loopId: loop.id });
    }, [navigation]);

    // Handle edit loop
    const handleEditLoop = useCallback((loop: Loop) => {
        logNavigation('LoopBuilderScreen', { mode: 'edit', id: loop.id });
        navigation.navigate('LoopBuilderScreen', {
            mode: 'edit',
            id: loop.id
        });
    }, [navigation]);

    // Handle duplicate loop
    const handleDuplicateLoop = useCallback((loop: Loop) => {
        logLoop('Duplicating loop', loop.id);
        // TODO: Implement duplicate functionality
        console.log('Duplicate loop:', loop.id);
    }, []);

    // Handle delete loop
    const handleDeleteLoop = useCallback((loop: Loop) => {
        logLoop('Deleting loop', loop.id);
        // TODO: Implement delete functionality
        console.log('Delete loop:', loop.id);
    }, []);

    // Handle toggle tag
    const handleToggleTag = useCallback((tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    }, []);

    // Handle toggle view
    const handleToggleView = useCallback(() => {
        setIsGridView(prev => !prev);
    }, []);

    // Filter loops based on search term, tags, category, etc.
    const filterLoops = useCallback((loop: Loop) => {
        logLoop('Filtering loop', loop.id, {
            title: loop.title,
            searchTerm,
            selectedTags,
            categoryId
        });

        // Search term filter
        if (searchTerm && !loop.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !(loop.description?.toLowerCase().includes(searchTerm.toLowerCase()))) {
            return false;
        }

        // Tags filter
        if (selectedTags.length > 0 && !selectedTags.some(tag => loop.tags.includes(tag))) {
            return false;
        }

        // Category filter
        if (categoryId && loop.categoryId !== categoryId) {
            return false;
        }

        return true;
    }, [searchTerm, selectedTags, categoryId]);

    // Sort loops comparison function
    const sortLoops = useCallback((a: Loop, b: Loop, sortOrder: 'newest' | 'oldest' | 'alphabetical') => {
        switch (sortOrder) {
            case 'alphabetical':
                return a.title.localeCompare(b.title);
            case 'oldest':
                return a.createdAt.getTime() - b.createdAt.getTime();
            case 'newest':
            default:
                return b.createdAt.getTime() - a.createdAt.getTime();
        }
    }, []);

    // Render loop item using LoopCard
    const renderItem = useCallback(({ item }: { item: Loop }) => {
        logLoop('Rendering loop item', item.id, { title: item.title });

        return (
            <LoopCard
                loop={item}
                templates={templates}
                onPress={() => handleLoopPress(item)}
                onEdit={() => handleEditLoop(item)}
                onDuplicate={() => handleDuplicateLoop(item)}
                onDelete={() => handleDeleteLoop(item)}
            />
        );
    }, [templates, handleLoopPress, handleEditLoop, handleDuplicateLoop, handleDeleteLoop]);

    // Handle create loop
    const handleCreateLoop = useCallback(() => {
        logNavigation('LoopBuilderScreen', { mode: 'create' });
        navigation.navigate('LoopBuilderScreen', {
            mode: 'create'
        });
    }, [navigation]);

    // loadLoops already returns Promise<void>
    const loadLoopsWrapper = loadLoops;

    return (
        <>
            <FilterableList
                data={loops}
                loadData={loadLoopsWrapper}
                renderItem={renderItem}
                allTags={allTags}
                selectedTags={selectedTags}
                onToggleTag={handleToggleTag}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                emptyIcon="repeat"
                emptyText="No loops found. Create your first loop!"
                keyExtractor={(item) => item.id}
                filterPredicate={filterLoops}
                sortItems={sortLoops}
                isGridView={isGridView}
                onToggleView={handleToggleView}
                onCreateItem={handleCreateLoop}
                createButtonLabel="Create Loop"
                categories={formattedCategories}
            />
        </>
    );
}