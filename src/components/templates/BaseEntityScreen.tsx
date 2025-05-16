import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { FilterableList, type FilterableListProps } from '../organisms/FilterableList';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Icon, IconName } from '../atoms/Icon';

/**
 * Base props for entity data
 */
export interface BaseEntity {
    id: string;
    createdAt: number;
    updatedAt: number;
    title?: string;
    name?: string;
}

/**
 * Props for the BaseEntityScreen component
 */
export interface BaseEntityScreenProps<T extends BaseEntity> {
    /**
     * Array of entity data
     */
    data: T[];

    /**
     * Function to load/refresh data
     */
    loadData: () => Promise<void>;

    /**
     * Function to render each list item
     */
    renderItem: React.ComponentProps<typeof FilterableList>['renderItem'];

    /**
     * Function to create a new entity
     */
    onCreateEntity?: () => void;

    /**
     * Title for the create button
     */
    createButtonLabel?: string;

    /**
     * Icon to display when list is empty
     */
    emptyIcon: IconName;

    /**
     * Text to display when list is empty
     */
    emptyText: string;

    /**
     * Current search term
     */
    searchTerm?: string;

    /**
     * Function to update search term
     */
    onSearchChange?: (text: string) => void;

    /**
     * All available tags for filtering
     */
    allTags?: string[];

    /**
     * Currently selected tags
     */
    selectedTags?: string[];

    /**
     * Function to toggle tag selection
     */
    onToggleTag?: (tag: string) => void;

    /**
     * Current sort order
     */
    sortOrder?: 'newest' | 'oldest' | 'alphabetical';

    /**
     * Function to update sort order
     */
    onSortChange?: (sortOrder: 'newest' | 'oldest' | 'alphabetical') => void;

    /**
     * Category ID for filtering
     */
    categoryId?: string | null;

    /**
     * Function to update category
     */
    onCategoryChange?: (id: string | null) => void;

    /**
     * Whether to show in grid view
     */
    isGridView?: boolean;

    /**
     * Function to toggle grid/list view
     */
    onToggleView?: () => void;

    /**
     * Whether data is currently loading
     */
    isLoading?: boolean;

    /**
     * Extra props to pass to FilterableList
     */
    listProps?: Partial<React.ComponentProps<typeof FilterableList>>;

    /**
     * Header component to render above the list
     */
    ListHeaderComponent?: React.ReactNode;
}

/**
 * BaseEntityScreen template component provides a standard layout for entity list screens
 * with filtering, searching, sorting, and view options.
 */
export function BaseEntityScreen<T extends BaseEntity>({
    data,
    loadData,
    renderItem,
    onCreateEntity,
    createButtonLabel,
    emptyIcon,
    emptyText,
    searchTerm = '',
    onSearchChange,
    allTags = [],
    selectedTags = [],
    onToggleTag,
    sortOrder = 'newest',
    onSortChange,
    categoryId = null,
    onCategoryChange,
    isGridView = false,
    onToggleView,
    isLoading = false,
    listProps = {},
    ListHeaderComponent,
}: BaseEntityScreenProps<T>) {
    const { theme } = useTheme();

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
    }));

    const defaultFilterPredicate = (item: T, searchTerm: string, selectedTags: string[], categoryId: string | null) => {
        const title = item.title || item.name || '';
        const matchesSearch = searchTerm === '' ||
            title.toLowerCase().includes(searchTerm.toLowerCase());

        // If no tags selected, or tags property doesn't exist, proceed with search match only
        if (!selectedTags.length || !(item as any).tags) {
            return matchesSearch;
        }

        // Otherwise, check if any selected tag is in the item's tags
        const matchesTags = selectedTags.some(tag =>
            (item as any).tags && (item as any).tags.includes(tag)
        );

        // Check category match if applicable
        const matchesCategory = !categoryId || (item as any).categoryId === categoryId;

        return matchesSearch && matchesTags && matchesCategory;
    };

    const defaultSortItems = (a: T, b: T, sortOrder: 'newest' | 'oldest' | 'alphabetical') => {
        if (sortOrder === 'newest') {
            return b.updatedAt - a.updatedAt;
        } else if (sortOrder === 'oldest') {
            return a.updatedAt - b.updatedAt;
        } else {
            // Alphabetical
            const aTitle = a.title || a.name || '';
            const bTitle = b.title || b.name || '';
            return aTitle.localeCompare(bTitle);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <FilterableList
                data={data}
                loadData={loadData}
                renderItem={renderItem}
                emptyIcon={emptyIcon}
                emptyText={emptyText}
                keyExtractor={(item: T) => item.id}
                filterPredicate={defaultFilterPredicate}
                sortItems={defaultSortItems}
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                allTags={allTags}
                selectedTags={selectedTags}
                onToggleTag={onToggleTag}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                categoryId={categoryId}
                onCategoryChange={onCategoryChange}
                isGridView={isGridView}
                onToggleView={onToggleView}
                onCreateItem={onCreateEntity}
                createButtonLabel={createButtonLabel}
                isLoading={isLoading}
                ListHeaderComponent={ListHeaderComponent}
                {...listProps}
            />
        </SafeAreaView>
    );
} 