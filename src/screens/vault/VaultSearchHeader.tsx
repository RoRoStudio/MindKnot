// src/screens/vault/VaultSearchHeader.tsx - Optimized with performance improvements
import React, { useCallback, memo, useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../../components/common/Typography';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../../components/common/Icon';
import { useVaultFilters } from '../../contexts/VaultFiltersContext';
import { useCategories } from '../../hooks/useCategories';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface VaultSearchHeaderProps {
    allTags: string[];
    showCategoriesFilter?: boolean;
}

export const VaultSearchHeader: React.FC<VaultSearchHeaderProps> = memo(({
    allTags,
    showCategoriesFilter = true
}) => {
    const {
        searchTerm,
        setSearchTerm,
        selectedTags,
        toggleTag,
        categoryId,
        setCategoryId,
        sort,
        setSort,
        clearFilters
    } = useVaultFilters();

    const { categories } = useCategories();
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
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            paddingHorizontal: theme.spacing.s,
            height: 40,
        },
        searchInput: {
            flex: 1,
            marginLeft: theme.spacing.s,
            color: theme.colors.textPrimary,
            fontSize: theme.typography.fontSize.m,
            height: 40,
            padding: 0,
        },
        filtersButton: {
            marginLeft: theme.spacing.s,
            padding: theme.spacing.xs,
            backgroundColor: filterCount > 0 ? theme.colors.primary : theme.colors.surface,
            borderRadius: theme.shape.radius.s,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: theme.spacing.s,
        },
        filtersContainer: {
            padding: theme.spacing.s,
            paddingTop: 0,
        },
        chipScrollContainer: {
            marginBottom: theme.spacing.xs,
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
        chip: {
            paddingHorizontal: theme.spacing.s,
            paddingVertical: 6,
            borderRadius: theme.shape.radius.m,
            marginRight: theme.spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        activeChip: {
            borderColor: theme.colors.primary,
            backgroundColor: `${theme.colors.primary}10`,
        },
        chipText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
        },
        activeChipText: {
            color: theme.colors.primary,
        },
        sortRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.s,
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
        colorIndicator: {
            width: 8,
            height: 8,
            borderRadius: 4,
            marginRight: 4,
        },
        badge: {
            backgroundColor: theme.colors.onPrimary,
            borderRadius: 10,
            width: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
        },
        badgeText: {
            color: theme.colors.primary,
            fontSize: 10,
            fontWeight: 'bold',
        },
        clearButton: {
            padding: theme.spacing.xs,
        },
    }));

    // Toggle filters expanded state
    const toggleFilters = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFiltersExpanded(!filtersExpanded);
    }, [filtersExpanded]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        clearFilters();
    }, [clearFilters]);

    // Memoized handler for tag selection
    const handleTagToggle = useCallback((tag: string) => {
        toggleTag(tag);
    }, [toggleTag]);

    // Memoized handler for category selection
    const handleCategoryToggle = useCallback((id: string | null) => {
        setCategoryId(id === categoryId ? null : id);
    }, [setCategoryId, categoryId]);

    // Memoized handler for sort selection
    const handleSortChange = useCallback((newSort: 'newest' | 'oldest' | 'alphabetical') => {
        setSort(newSort);
    }, [setSort]);

    return (
        <View style={styles.container}>
            {/* Search bar and filter button row */}
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Icon name="search" width={16} height={16} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        returnKeyType="search"
                    />
                    {searchTerm ? (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <Icon name="x" width={16} height={16} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <TouchableOpacity style={styles.filtersButton} onPress={toggleFilters}>
                    <Icon
                        name="sliders-vertical"
                        width={16}
                        height={16}
                        color={filterCount > 0 ? theme.colors.onPrimary : theme.colors.textSecondary}
                    />
                    {filterCount > 0 && (
                        <View style={styles.badge}>
                            <Typography style={styles.badgeText}>
                                {filterCount}
                            </Typography>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Expandable filters section */}
            {filtersExpanded && (
                <View style={styles.filtersContainer}>
                    {/* Categories filter */}
                    {showCategoriesFilter && categories.length > 0 && (
                        <>
                            <View style={styles.filterRow}>
                                <Typography style={styles.filterLabel}>Categories</Typography>
                                {categoryId && (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={() => setCategoryId(null)}
                                    >
                                        <Icon name="x" width={12} height={12} color={theme.colors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.chipScrollContainer}
                            >
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.id}
                                        style={[
                                            styles.chip,
                                            categoryId === category.id && styles.activeChip
                                        ]}
                                        onPress={() => handleCategoryToggle(category.id)}
                                    >
                                        <View
                                            style={[
                                                styles.colorIndicator,
                                                { backgroundColor: category.color },
                                            ]}
                                        />
                                        <Typography
                                            style={[
                                                styles.chipText,
                                                categoryId === category.id && styles.activeChipText
                                            ]}
                                        >
                                            {category.title}
                                        </Typography>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* Divider */}
                    {showCategoriesFilter && categories.length > 0 && allTags.length > 0 && (
                        <View style={styles.divider} />
                    )}

                    {/* Tags filter */}
                    {allTags.length > 0 && (
                        <>
                            <View style={styles.filterRow}>
                                <Typography style={styles.filterLabel}>Tags</Typography>
                                {selectedTags.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={() => {
                                            selectedTags.forEach(tag => toggleTag(tag));
                                        }}
                                    >
                                        <Icon name="x" width={12} height={12} color={theme.colors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.chipScrollContainer}
                            >
                                {allTags.map((tag) => (
                                    <TouchableOpacity
                                        key={tag}
                                        style={[
                                            styles.chip,
                                            selectedTags.includes(tag) && styles.activeChip
                                        ]}
                                        onPress={() => handleTagToggle(tag)}
                                    >
                                        <Typography
                                            style={[
                                                styles.chipText,
                                                selectedTags.includes(tag) && styles.activeChipText
                                            ]}
                                        >
                                            #{tag}
                                        </Typography>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Sort options */}
                    <View style={styles.filterRow}>
                        <Typography style={styles.filterLabel}>Sort by</Typography>
                    </View>
                    <View style={styles.sortRow}>
                        <TouchableOpacity
                            style={[styles.sortButton, sort === 'newest' && styles.activeSortButton]}
                            onPress={() => handleSortChange('newest')}
                        >
                            <Typography
                                style={[
                                    styles.sortButtonText,
                                    sort === 'newest' && styles.activeSortButtonText
                                ]}
                            >
                                Newest
                            </Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortButton, sort === 'oldest' && styles.activeSortButton]}
                            onPress={() => handleSortChange('oldest')}
                        >
                            <Typography
                                style={[
                                    styles.sortButtonText,
                                    sort === 'oldest' && styles.activeSortButtonText
                                ]}
                            >
                                Oldest
                            </Typography>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sortButton, sort === 'alphabetical' && styles.activeSortButton]}
                            onPress={() => handleSortChange('alphabetical')}
                        >
                            <Typography
                                style={[
                                    styles.sortButtonText,
                                    sort === 'alphabetical' && styles.activeSortButtonText
                                ]}
                            >
                                A-Z
                            </Typography>
                        </TouchableOpacity>
                    </View>

                    {/* Clear all filters button */}
                    {filterCount > 0 && (
                        <TouchableOpacity
                            style={[
                                styles.sortButton,
                                {
                                    marginTop: theme.spacing.s,
                                    backgroundColor: theme.colors.surface,
                                    alignSelf: 'center',
                                    paddingHorizontal: theme.spacing.m,
                                    borderWidth: 1,
                                    borderColor: theme.colors.error
                                }
                            ]}
                            onPress={handleClearFilters}
                        >
                            <Typography
                                style={[
                                    styles.sortButtonText,
                                    { color: theme.colors.error }
                                ]}
                            >
                                Clear All Filters
                            </Typography>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
});