// src/screens/vault/BaseVaultScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, View, RefreshControl, FlatList, ListRenderItem } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { useVaultFilters } from '../../contexts/VaultFiltersContext';
import { VaultSearchHeader } from './VaultSearchHeader';
import { VaultEmptyState } from './VaultEmptyState';
import { IconName } from '../../components/common/Icon';
import { useBottomSheet } from '../../contexts/BottomSheetContext';
import { useTheme } from '../../contexts/ThemeContext';

interface BaseVaultScreenProps<T> {
    data: T[];
    loadData: () => Promise<void>;
    renderItem: ListRenderItem<T>;

    allTags: string[];
    type: 'notes' | 'sparks' | 'actions' | 'paths' | 'loops';
    emptyIcon: IconName;
    keyExtractor: (item: T) => string;
    filterPredicate: (item: T, searchTerm: string, selectedTags: string[], categoryId: string | null) => boolean;
    sortItems: (a: T, b: T, sortOrder: 'newest' | 'oldest' | 'alphabetical') => number;
}

export function BaseVaultScreen<T>({
    data,
    loadData,
    renderItem,
    allTags,
    type,
    emptyIcon,
    keyExtractor,
    filterPredicate,
    sortItems,
}: BaseVaultScreenProps<T>) {
    const { theme } = useTheme();
    const {
        showNoteForm,
        showSparkForm,
        showActionForm,
        showPathForm,
        showLoopForm
    } = useBottomSheet();

    const {
        searchTerm,
        selectedTags,
        categoryId,
        sort
    } = useVaultFilters();

    const [refreshing, setRefreshing] = useState(false);
    const [filteredData, setFilteredData] = useState<T[]>([]);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
        },
    }));

    // Apply filters and sorting
    useEffect(() => {
        let filtered = data.filter(item =>
            filterPredicate(item, searchTerm, selectedTags, categoryId)
        );

        filtered.sort((a, b) => sortItems(a, b, sort));

        setFilteredData(filtered);
    }, [data, searchTerm, selectedTags, categoryId, sort, filterPredicate, sortItems]);

    // Pull-to-refresh handler
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadData();
        } finally {
            setRefreshing(false);
        }
    }, [loadData]);

    // Handle create button press
    const handleCreate = useCallback(() => {
        switch (type) {
            case 'notes':
                showNoteForm();
                break;
            case 'sparks':
                showSparkForm();
                break;
            case 'actions':
                showActionForm();
                break;
            case 'paths':
                showPathForm();
                break;
            case 'loops':
                showLoopForm();
                break;
        }
    }, [type, showNoteForm, showSparkForm, showActionForm, showPathForm, showLoopForm]);

    // Check if filters are applied
    const hasFiltersApplied = searchTerm !== '' || selectedTags.length > 0 || categoryId !== null;

    return (
        <View style={styles.container}>
            <VaultSearchHeader allTags={allTags} />

            <View style={styles.content}>
                {filteredData.length === 0 ? (
                    <VaultEmptyState
                        type={type}
                        onCreatePress={handleCreate}
                        icon={emptyIcon}
                        hasFiltersApplied={hasFiltersApplied}
                    />
                ) : (
                    <FlatList
                        data={filteredData}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[theme.colors.primary]}
                                tintColor={theme.colors.primary}
                            />
                        }
                    />
                )}
            </View>
        </View>
    );
}