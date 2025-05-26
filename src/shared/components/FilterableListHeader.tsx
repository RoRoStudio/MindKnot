import React, { useCallback, memo, useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { useTheme } from '../../app/contexts/ThemeContext';
import { Icon, IconName, Typography, Label, CategoryPill } from './';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Category object structure
 */
export interface Category {
    /**
     * Unique identifier for the category
     */
    id: string;

    /**
     * Display title for the category
     */
    title: string;

    /**
     * Color associated with the category (hex format)
     */
    color: string;
}

/**
 * Props for the FilterableListHeader component
 */
export interface FilterableListHeaderProps {
    /**
     * Current search term
     */
    searchTerm: string;

    /**
     * Function to update search term
     */
    onSearchChange: (text: string) => void;

    /**
     * Array of all possible tags for filtering
     */
    allTags: string[];

    /**
     * Currently selected tags
     */
    selectedTags: string[];

    /**
     * Function to toggle tag selection
     */
    onToggleTag: (tag: string) => void;

    /**
     * All available categories
     */
    categories: Category[];

    /**
     * Currently selected category ID
     */
    categoryId: string | null;

    /**
     * Function to update selected category
     */
    onCategoryChange: (id: string | null) => void;

    /**
     * Current sort order
     */
    sortOrder: 'newest' | 'oldest' | 'alphabetical';

    /**
     * Function to update sort order
     */
    onSortChange: (sort: 'newest' | 'oldest' | 'alphabetical') => void;

    /**
     * Function to clear all filters
     */
    onClearFilters: () => void;

    /**
     * Whether to show categories filter
     * @default true
     */
    showCategoriesFilter?: boolean;
}

/**
 * FilterableListHeader component provides search, filtering, and sorting controls
 * for use with FilterableList
 */
export const FilterableListHeader = memo<FilterableListHeaderProps>(({
    searchTerm,
    onSearchChange,
    allTags,
    selectedTags,
    onToggleTag,
    categories,
    categoryId,
    onCategoryChange,
    sortOrder,
    onSortChange,
    onClearFilters,
    showCategoriesFilter = true
}) => {
    const { theme } = useTheme();
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Count active filters
    const hasFilters = searchTerm || selectedTags.length > 0 || categoryId;
    const filterCount = (searchTerm ? 1 : 0) + selectedTags.length + (categoryId ? 1 : 0);

    const styles = useStyles((theme) => ({
        container: {
            backgroundColor: theme.colors.background,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.divider,
            zIndex: 10,
        },
        searchRow: {
            padding: 10,
            paddingHorizontal: 16,
        },
        searchAndFilterContainer: {
            flexDirection: 'row',
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
            height: 40,
            overflow: 'hidden',
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
        },
        searchInput: {
            flex: 1,
            marginLeft: 8,
            color: theme.colors.textPrimary,
            fontSize: theme.typography.fontSize.m,
            height: 40,
            padding: 0,
        },
        filtersButton: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        filtersBadge: {
            position: 'absolute',
            top: 5,
            right: 5,
            backgroundColor: theme.colors.primary,
            width: 16,
            height: 16,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
        },
        filtersBadgeText: {
            color: theme.colors.onPrimary,
            fontSize: 10,
            fontWeight: 'bold',
        },
        filtersContainer: {
            padding: theme.spacing.s,
            paddingTop: 0,
        },
        chipScrollContainer: {
            marginBottom: theme.spacing.xs,
        },
        filterSection: {
            marginBottom: theme.spacing.s,
        },
        filterRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.xs,
            paddingHorizontal: theme.spacing.xs,
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.divider,
            marginVertical: theme.spacing.xs,
        },
        filterLabel: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        sortRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.s,
            marginBottom: theme.spacing.s,
        },
        sortButton: {
            paddingHorizontal: theme.spacing.s,
            paddingVertical: 6,
            borderRadius: theme.shape.radius.s,
            backgroundColor: theme.colors.surface,
            minWidth: 70,
            alignItems: 'center',
        },
        activeSortButton: {
            backgroundColor: theme.colors.primary,
        },
        sortButtonText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
        },
        activeSortButtonText: {
            color: theme.colors.onPrimary,
        },
        clearFiltersRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingHorizontal: theme.spacing.s,
            marginBottom: theme.spacing.xs,
        },
        clearFiltersButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.xs,
        },
        clearFiltersText: {
            color: theme.colors.error,
            fontSize: theme.typography.fontSize.xs,
            marginLeft: 4,
        },
        tagsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: theme.spacing.s,
            gap: theme.spacing.xs,
        }
    }));

    const toggleFilters = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFiltersExpanded(!filtersExpanded);
    };

    // Render tag items
    const renderTagItems = () => {
        if (!allTags.length) return null;

        return (
            <View style={styles.filterSection}>
                <View style={styles.filterRow}>
                    <Typography style={styles.filterLabel}>TAGS</Typography>
                </View>
                <View style={styles.tagsRow}>
                    {allTags.map(tag => (
                        <Label
                            key={tag}
                            label={tag}
                            selected={selectedTags.includes(tag)}
                            onPress={() => onToggleTag(tag)}
                            selectable
                        />
                    ))}
                </View>
            </View>
        );
    };

    // Render category items
    const renderCategoryItems = () => {
        if (!categories.length || !showCategoriesFilter) return null;

        return (
            <View style={styles.filterSection}>
                <View style={styles.filterRow}>
                    <Typography style={styles.filterLabel}>CATEGORIES</Typography>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.chipScrollContainer}
                    contentContainerStyle={{
                        paddingHorizontal: theme.spacing.s,
                        paddingBottom: theme.spacing.xs,
                        gap: theme.spacing.xs,
                    }}
                >
                    <CategoryPill
                        key="all"
                        title="All"
                        color={theme.colors.textSecondary}
                        selectable
                        selected={!categoryId}
                        onPress={() => onCategoryChange(null)}
                    />
                    {categories.map(category => (
                        <CategoryPill
                            key={category.id}
                            title={category.title}
                            color={category.color}
                            selectable
                            selected={categoryId === category.id}
                            onPress={() => onCategoryChange(category.id)}
                        />
                    ))}
                </ScrollView>
            </View>
        );
    };

    // Render sort options
    const renderSortOptions = () => {
        return (
            <View style={styles.filterSection}>
                <View style={styles.filterRow}>
                    <Typography style={styles.filterLabel}>SORT BY</Typography>
                </View>
                <View style={styles.sortRow}>
                    <TouchableOpacity
                        style={[
                            styles.sortButton,
                            sortOrder === 'newest' && styles.activeSortButton,
                        ]}
                        onPress={() => onSortChange('newest')}
                    >
                        <Typography
                            style={[
                                styles.sortButtonText,
                                sortOrder === 'newest' && styles.activeSortButtonText,
                            ]}
                        >
                            Newest
                        </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sortButton,
                            sortOrder === 'oldest' && styles.activeSortButton,
                        ]}
                        onPress={() => onSortChange('oldest')}
                    >
                        <Typography
                            style={[
                                styles.sortButtonText,
                                sortOrder === 'oldest' && styles.activeSortButtonText,
                            ]}
                        >
                            Oldest
                        </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sortButton,
                            sortOrder === 'alphabetical' && styles.activeSortButton,
                        ]}
                        onPress={() => onSortChange('alphabetical')}
                    >
                        <Typography
                            style={[
                                styles.sortButtonText,
                                sortOrder === 'alphabetical' && styles.activeSortButtonText,
                            ]}
                        >
                            A to Z
                        </Typography>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Render filter options
    const renderFilterOptions = () => {
        if (!filtersExpanded) return null;

        return (
            <View style={styles.filtersContainer}>
                {hasFilters && (
                    <View style={styles.clearFiltersRow}>
                        <TouchableOpacity
                            style={styles.clearFiltersButton}
                            onPress={onClearFilters}
                        >
                            <Icon
                                name="x"
                                width={12}
                                height={12}
                                color={theme.colors.error}
                            />
                            <Typography style={styles.clearFiltersText}>Clear Filters</Typography>
                        </TouchableOpacity>
                    </View>
                )}

                {renderCategoryItems()}
                <View style={styles.divider} />
                {renderTagItems()}
                <View style={styles.divider} />
                {renderSortOptions()}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchRow}>
                <View style={styles.searchAndFilterContainer}>
                    <View style={styles.searchContainer}>
                        <Icon
                            name="search"
                            width={18}
                            height={18}
                            color={theme.colors.textSecondary}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={searchTerm}
                            onChangeText={onSearchChange}
                        />
                        {searchTerm ? (
                            <TouchableOpacity onPress={() => onSearchChange('')}>
                                <Icon
                                    name="x"
                                    width={16}
                                    height={16}
                                    color={theme.colors.textSecondary}
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <TouchableOpacity style={styles.filtersButton} onPress={toggleFilters}>
                        <Icon
                            name="sliders-vertical"
                            width={20}
                            height={20}
                            color={theme.colors.textPrimary}
                        />
                        {filterCount > 0 && (
                            <View style={styles.filtersBadge}>
                                <Typography style={styles.filtersBadgeText}>{filterCount}</Typography>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {renderFilterOptions()}
        </View>
    );
}); 