// src/screens/vault/BaseVaultScreen.tsx
import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import {
    SafeAreaView,
    View,
    RefreshControl,
    FlatList,
    ListRenderItem,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar
} from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useVaultFilters } from '../../app/contexts/VaultFiltersContext';
import { VaultEmptyState } from './VaultEmptyState';
import { Icon, IconName } from '../components';
import { useBottomSheet } from '../../app/contexts/BottomSheetContext';
import { useTheme } from '../../app/contexts/ThemeContext';

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
    const [isGridView, setIsGridView] = useState(type === 'sparks' || type === 'notes');
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const listRef = useRef<FlatList>(null);

    // Handle open action menus
    const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
        },
        listContainer: {
            flex: 1,
            paddingTop: 4, // Add small padding at the top
        },
        layoutToggle: {
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 6,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            zIndex: 10,
        },
        gridContainer: {
            padding: theme.spacing.s,
            paddingBottom: 70, // Add extra padding at bottom to account for fab button
        },
        listContentContainer: {
            padding: theme.spacing.m,
            paddingBottom: 70, // Add extra padding at bottom to account for fab button
            flexGrow: 1,
        },
        gridItem: {
            width: (windowWidth - theme.spacing.s * 6) / 2,
            margin: theme.spacing.xs,
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 5,
        },
        spinner: {
            position: 'absolute',
            top: windowHeight / 2 - 25,
            left: windowWidth / 2 - 25,
            width: 50,
            height: 50,
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

    // Close action menu when tapping outside
    const handleCloseActionMenu = useCallback(() => {
        if (activeActionMenuId) {
            setActiveActionMenuId(null);
            return true; // Event was handled
        }
        return false; // Event wasn't handled
    }, [activeActionMenuId]);

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

    // Toggle between grid and list view
    const toggleLayout = () => {
        setIsGridView(!isGridView);
    };

    // Wrapper for the renderItem function to apply grid styling
    const gridRenderItem = useMemo(() => {
        return ({ item, index }: any) => {
            return (
                <View style={styles.gridItem}>
                    {renderItem({
                        item,
                        index,
                        // Pass additional props to handle action menu
                        extraData: {
                            setActiveActionMenuId,
                            activeActionMenuId
                        }
                    } as any)}
                </View>
            );
        };
    }, [renderItem, activeActionMenuId, styles.gridItem]);

    // Enhance the renderItem to pass action menu state
    const enhancedRenderItem = useMemo(() => {
        return (props: any) => {
            return renderItem({
                ...props,
                // Pass additional props to handle action menu
                extraData: {
                    setActiveActionMenuId,
                    activeActionMenuId
                }
            });
        };
    }, [renderItem, activeActionMenuId]);

    // Check if filters are applied
    const hasFiltersApplied = searchTerm !== '' || selectedTags.length > 0 || categoryId !== null;

    // Only show layout toggle for notes and sparks
    const showLayoutToggle = type === 'notes' || type === 'sparks';

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={handleCloseActionMenu}>
                <View style={styles.container}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        style={styles.content}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                    >
                        {filteredData.length === 0 ? (
                            <VaultEmptyState
                                type={type}
                                onCreatePress={handleCreate}
                                icon={emptyIcon}
                                hasFiltersApplied={hasFiltersApplied}
                            />
                        ) : (
                            <View style={styles.listContainer}>
                                {isGridView ? (
                                    <FlatList
                                        ref={listRef}
                                        key="grid"
                                        data={filteredData}
                                        renderItem={gridRenderItem}
                                        keyExtractor={keyExtractor}
                                        numColumns={2}
                                        contentContainerStyle={styles.gridContainer}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={onRefresh}
                                                colors={[theme.colors.primary]}
                                                tintColor={theme.colors.primary}
                                            />
                                        }
                                        onScrollBeginDrag={Keyboard.dismiss}
                                        removeClippedSubviews={true}
                                        initialNumToRender={8}
                                        maxToRenderPerBatch={10}
                                        windowSize={10}
                                    />
                                ) : (
                                    <FlatList
                                        ref={listRef}
                                        key="list"
                                        data={filteredData}
                                        renderItem={enhancedRenderItem}
                                        keyExtractor={keyExtractor}
                                        contentContainerStyle={styles.listContentContainer}
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={onRefresh}
                                                colors={[theme.colors.primary]}
                                                tintColor={theme.colors.primary}
                                            />
                                        }
                                        onScrollBeginDrag={Keyboard.dismiss}
                                        removeClippedSubviews={true}
                                        initialNumToRender={8}
                                        maxToRenderPerBatch={10}
                                        windowSize={10}
                                    />
                                )}

                                {showLayoutToggle && (
                                    <TouchableOpacity
                                        style={styles.layoutToggle}
                                        onPress={toggleLayout}
                                        activeOpacity={0.9}
                                    >
                                        <Icon
                                            name={isGridView ? 'rows-2' : 'layout-grid'}
                                            width={24}
                                            height={24}
                                            color={theme.colors.onPrimary}
                                        />
                                    </TouchableOpacity>
                                )}

                                {/* Semi-transparent overlay when action menu is open */}
                                {activeActionMenuId && (
                                    <TouchableOpacity
                                        style={styles.overlay}
                                        activeOpacity={1}
                                        onPress={handleCloseActionMenu}
                                    />
                                )}
                            </View>
                        )}
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}