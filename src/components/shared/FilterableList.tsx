import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import {
    SafeAreaView,
    View,
    RefreshControl,
    FlatList,
    ListRenderItem,
    ListRenderItemInfo,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Icon, IconName, Typography } from '../common';
import { useBottomSheet } from '../../contexts/BottomSheetContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FilterableListHeader, Category } from './FilterableListHeader';

/**
 * Props for the FilterableList component
 */
export interface FilterableListProps<T> {
    /**
     * Array of data items to display in the list
     */
    data: T[];

    /**
     * Function to load/refresh data
     */
    loadData: () => Promise<void>;

    /**
     * The render function for each item
     */
    renderItem: ListRenderItem<T>;

    /**
     * All possible tags for the filter
     */
    allTags?: string[];

    /**
     * Currently selected tags for filtering
     */
    selectedTags?: string[];

    /**
     * Function to toggle a tag selection
     */
    onToggleTag?: (tag: string) => void;

    /**
     * Current search term
     */
    searchTerm?: string;

    /**
     * Function to update search term
     */
    onSearchChange?: (text: string) => void;

    /**
     * Currently selected category ID
     */
    categoryId?: string | null;

    /**
     * Function to update selected category
     */
    onCategoryChange?: (id: string | null) => void;

    /**
     * Current sort order
     */
    sortOrder?: 'newest' | 'oldest' | 'alphabetical';

    /**
     * Function to update sort order
     */
    onSortChange?: (sort: 'newest' | 'oldest' | 'alphabetical') => void;

    /**
     * Icon to display when list is empty
     */
    emptyIcon: IconName;

    /**
     * Text to display when list is empty
     */
    emptyText: string;

    /**
     * Function to extract key for each item
     */
    keyExtractor: (item: T) => string;

    /**
     * Function to filter items based on filters
     */
    filterPredicate?: (item: T, searchTerm: string, selectedTags: string[], categoryId: string | null) => boolean;

    /**
     * Function to sort items
     */
    sortItems?: (a: T, b: T, sortOrder: 'newest' | 'oldest' | 'alphabetical') => number;

    /**
     * Whether to show items in grid vs list view
     */
    isGridView?: boolean;

    /**
     * Function to toggle between grid and list view
     */
    onToggleView?: () => void;

    /**
     * Function to create a new item
     */
    onCreateItem?: () => void;

    /**
     * Header component to render above the list
     */
    ListHeaderComponent?: React.ReactNode;

    /**
     * Whether data is currently loading
     */
    isLoading?: boolean;

    /**
     * Extra props for FlatList
     */
    listProps?: Partial<React.ComponentProps<typeof FlatList>>;

    /**
     * Whether to show the create button
     */
    showCreateButton?: boolean;

    /**
     * Label for create button
     */
    createButtonLabel?: string;

    /**
     * Categories for the filter
     */
    categories?: Category[];
}

/**
 * FilterableList component provides a complete list with filtering, sorting,
 * and view options for displaying and managing collections of data
 */
export function FilterableList<T>({
    data,
    loadData,
    renderItem,
    allTags = [],
    selectedTags = [],
    onToggleTag = () => { },
    searchTerm = '',
    onSearchChange = () => { },
    categoryId = null,
    onCategoryChange = () => { },
    sortOrder = 'newest',
    onSortChange = () => { },
    emptyIcon,
    emptyText,
    keyExtractor,
    filterPredicate,
    sortItems,
    isGridView = false,
    onToggleView,
    onCreateItem,
    ListHeaderComponent,
    isLoading = false,
    listProps = {},
    showCreateButton = true,
    createButtonLabel = 'Create',
    categories = []
}: FilterableListProps<T>) {
    const { theme } = useTheme();
    const listRef = React.useRef<FlatList<T>>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [filteredData, setFilteredData] = useState<T[]>([]);
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
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
        },
        gridContainer: {
            padding: 12,
            paddingBottom: 80, // Add extra padding at bottom for fab button
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.l,
        },
        emptyIcon: {
            marginBottom: theme.spacing.m,
            opacity: 0.7,
        },
        emptyText: {
            textAlign: 'center',
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.m,
        },
        fabContainer: {
            position: 'absolute',
            bottom: theme.spacing.m,
            right: theme.spacing.m,
            borderRadius: 28,
            paddingVertical: 14,
            paddingHorizontal: 20,
            backgroundColor: '#202030', // Dark blue/black from screenshot
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            flexDirection: 'row',
            alignItems: 'center',
            zIndex: 5, // Ensure it's above other elements
        },
        fabIcon: {
            marginRight: 8,
        },
        viewToggleButton: {
            position: 'absolute',
            bottom: theme.spacing.m,
            left: theme.spacing.m,
            borderRadius: 24,
            padding: 12,
            backgroundColor: '#F5F5F7', // Light gray from screenshot
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 5, // Ensure it's above other elements
        },
        fabLabel: {
            color: theme.colors.onPrimary,
            fontWeight: 'bold',
            fontFamily: 'KantumruyPro-SemiBold',
        },
        columnWrapperStyle: {
            justifyContent: 'space-between',
            paddingHorizontal: 4,
        },
        gridItem: {
            flex: 1,
            margin: 4,
            maxWidth: '48%', // Ensure two columns fit side by side
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        menuContainer: {
            position: 'absolute',
            right: 0,
            top: 0,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.s,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 100,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
        },
        menuItemText: {
            marginLeft: theme.spacing.s,
            color: theme.colors.textPrimary,
        },
        menuItemDanger: {
            color: theme.colors.error,
        },
    }));

    // Apply filters and sorting to data
    useEffect(() => {
        let result: T[] = [...data];

        // Apply filters if predicate provided
        if (filterPredicate && (searchTerm || selectedTags.length > 0 || categoryId)) {
            result = result.filter(item =>
                filterPredicate(item, searchTerm, selectedTags, categoryId)
            );
        }

        // Apply sorting if function provided
        if (sortItems) {
            result.sort((a, b) => sortItems(a, b, sortOrder));
        }

        setFilteredData(result);
    }, [data, searchTerm, selectedTags, categoryId, sortOrder, filterPredicate, sortItems]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Clear all filters
    const handleClearFilters = () => {
        onSearchChange('');
        selectedTags.forEach(tag => onToggleTag(tag));
        onCategoryChange(null);
    };

    // Toggle action menu for an item
    const toggleActionMenu = (id: string) => {
        // If same item, toggle off, otherwise show menu for selected item
        setActiveActionMenuId(prev => prev === id ? null : id);
    };

    // Scroll to top when filters change
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollToOffset({ animated: true, offset: 0 });
        }
    }, [searchTerm, selectedTags, categoryId, sortOrder]);

    // Dismiss keyboard when scrolling
    const handleScroll = () => {
        Keyboard.dismiss();
        setActiveActionMenuId(null);
    };

    // Render empty state
    const renderEmptyComponent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Icon
                    name={emptyIcon}
                    width={60}
                    height={60}
                    color={theme.colors.textSecondary}
                    style={styles.emptyIcon}
                />
                <Typography style={styles.emptyText}>{emptyText}</Typography>
            </View>
        );
    };

    // Additional list props based on view type
    const getListProps = () => {
        if (isGridView) {
            return {
                numColumns: 2,
                columnWrapperStyle: styles.columnWrapperStyle,
                contentContainerStyle: styles.gridContainer,
                renderItem: (info: ListRenderItemInfo<T>) => (
                    <View style={styles.gridItem}>
                        {renderItem(info)}
                    </View>
                ),
            };
        }
        return {
            contentContainerStyle: {
                padding: 16,
                paddingBottom: 80, // Add extra padding at bottom for fab button
            },
        };
    };

    return (
        <SafeAreaView style={styles.container}>
            <FilterableListHeader
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                allTags={allTags}
                selectedTags={selectedTags}
                onToggleTag={onToggleTag}
                categories={categories}
                categoryId={categoryId}
                onCategoryChange={onCategoryChange}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                onClearFilters={handleClearFilters}
            />

            <View style={styles.content}>
                <TouchableWithoutFeedback onPress={() => setActiveActionMenuId(null)}>
                    {isGridView ? (
                        <FlatList<T>
                            ref={listRef}
                            key="grid"
                            // @ts-ignore - filteredData is properly filtered from data which is of type T[]
                            data={filteredData}
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            numColumns={2}
                            ListEmptyComponent={renderEmptyComponent}
                            ListHeaderComponent={ListHeaderComponent as React.ComponentType<any> | React.ReactElement | null}
                            onScroll={handleScroll}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    colors={[theme.colors.primary]}
                                    tintColor={theme.colors.primary}
                                />
                            }
                            {...getListProps()}
                            {...listProps}
                        />
                    ) : (
                        <FlatList<T>
                            ref={listRef}
                            key="list"
                            // @ts-ignore - filteredData is properly filtered from data which is of type T[]
                            data={filteredData}
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            ListEmptyComponent={renderEmptyComponent}
                            ListHeaderComponent={ListHeaderComponent as React.ComponentType<any> | React.ReactElement | null}
                            onScroll={handleScroll}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    colors={[theme.colors.primary]}
                                    tintColor={theme.colors.primary}
                                />
                            }
                            {...getListProps()}
                            {...listProps}
                        />
                    )}
                </TouchableWithoutFeedback>
            </View>

            {/* View toggle button */}
            {onToggleView && (
                <TouchableOpacity
                    style={styles.viewToggleButton}
                    onPress={onToggleView}
                    activeOpacity={0.8}
                >
                    <Icon
                        name={isGridView ? 'list' : 'layout-grid'}
                        width={18}
                        height={18}
                        color={theme.colors.textPrimary}
                    />
                </TouchableOpacity>
            )}

            {/* Create Button */}
            {showCreateButton && onCreateItem && (
                <TouchableOpacity
                    style={styles.fabContainer}
                    onPress={onCreateItem}
                    activeOpacity={0.8}
                >
                    <Icon
                        name="plus"
                        width={18}
                        height={18}
                        color={theme.colors.onPrimary}
                        style={styles.fabIcon}
                    />
                    <Typography style={styles.fabLabel}>{createButtonLabel}</Typography>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
} 