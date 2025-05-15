// src/screens/vault/VaultSearchHeader.tsx - Optimized with performance improvements
import React, { useCallback, memo } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../../components/common/Typography';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../../components/common/Icon';
import { useVaultFilters } from '../../contexts/VaultFiltersContext';
import { useCategories } from '../../hooks/useCategories';

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

    const styles = useStyles((theme) => ({
        container: {
            padding: theme.spacing.m,
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.s,
            marginBottom: theme.spacing.m,
        },
        searchInput: {
            flex: 1,
            marginLeft: theme.spacing.s,
            color: theme.colors.textPrimary,
            fontSize: theme.typography.fontSize.m,
        },
        filterSection: {
            marginBottom: theme.spacing.m,
        },
        filterHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        filterTitle: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        filterIcon: {
            marginRight: theme.spacing.xs,
        },
        clearButton: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        clearButtonText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.primary,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.xs,
        },
        tagFilter: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.s,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: 4,
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
        },
        tagFilterActive: {
            backgroundColor: theme.colors.primary,
        },
        tagText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
        },
        tagTextActive: {
            color: theme.colors.white,
        },
        sortContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing.s,
        },
        sortOption: {
            padding: theme.spacing.s,
            borderRadius: theme.shape.radius.s,
        },
        sortOptionActive: {
            backgroundColor: theme.colors.surfaceVariant,
        },
        categoriesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.xs,
        },
        categoryChip: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.s,
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
            borderWidth: 1,
        },
        categoryChipSelected: {
            borderWidth: 2,
        },
        categoryChipLabel: {
            marginLeft: theme.spacing.xs,
            fontSize: theme.typography.fontSize.xs,
        },
        colorIndicator: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        badge: {
            position: 'absolute',
            top: -5,
            right: -5,
            backgroundColor: theme.colors.primary,
            borderRadius: 10,
            width: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        badgeText: {
            color: theme.colors.white,
            fontSize: 10,
        },
    }));

    // Check if any filters are applied
    const hasFilters = searchTerm || selectedTags.length > 0 || categoryId;
    const filterCount = (searchTerm ? 1 : 0) + selectedTags.length + (categoryId ? 1 : 0);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
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
            {/* Search bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" width={20} height={20} color={styles.tagText.color} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor={styles.tagText.color}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    returnKeyType="search"
                />
                {searchTerm ? (
                    <TouchableOpacity onPress={() => setSearchTerm('')}>
                        <Icon name="x" width={18} height={18} color={styles.tagText.color} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Filter header with count and clear button */}
            {hasFilters && (
                <View style={styles.filterHeader}>
                    <View style={styles.filterTitle}>
                        <Icon
                            name="list"
                            width={16}
                            height={16}
                            color={theme.colors.primary}
                            style={styles.filterIcon}
                        />
                        <Typography variant="body2">
                            Active Filters
                        </Typography>
                        {filterCount > 0 && (
                            <View style={styles.badge}>
                                <Typography style={styles.badgeText}>
                                    {filterCount}
                                </Typography>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearFilters}
                    >
                        <Typography style={styles.clearButtonText}>
                            Clear All
                        </Typography>
                        <Icon
                            name="x"
                            width={14}
                            height={14}
                            color={theme.colors.primary}
                            style={{ marginLeft: 4 }}
                        />
                    </TouchableOpacity>
                </View>
            )}

            {/* Categories filter */}
            {showCategoriesFilter && categories.length > 0 && (
                <View style={styles.filterSection}>
                    <Typography variant="body2" style={styles.filterTitle}>
                        Categories
                    </Typography>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesContainer}
                    >
                        {/* "All" option */}
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                {
                                    borderColor: categoryId === null ? theme.colors.primary : theme.colors.border,
                                    backgroundColor: categoryId === null ? theme.colors.primaryLight : theme.colors.surface,
                                },
                            ]}
                            onPress={() => handleCategoryToggle(null)}
                        >
                            <Typography style={styles.categoryChipLabel}>
                                All
                            </Typography>
                        </TouchableOpacity>

                        {/* Category chips */}
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryChip,
                                    {
                                        borderColor: categoryId === category.id ? category.color : theme.colors.border,
                                        backgroundColor: categoryId === category.id ? `${category.color}20` : theme.colors.surface,
                                    },
                                ]}
                                onPress={() => handleCategoryToggle(category.id)}
                            >
                                <View
                                    style={[
                                        styles.colorIndicator,
                                        { backgroundColor: category.color },
                                    ]}
                                />
                                <Typography style={styles.categoryChipLabel}>
                                    {category.title}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Tags filter */}
            {allTags.length > 0 && (
                <View style={styles.filterSection}>
                    <Typography variant="body2" style={styles.filterTitle}>
                        Tags
                    </Typography>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.tagsContainer}
                    >
                        {allTags.map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                style={[
                                    styles.tagFilter,
                                    selectedTags.includes(tag) && styles.tagFilterActive
                                ]}
                                onPress={() => handleTagToggle(tag)}
                            >
                                <Typography
                                    style={[
                                        styles.tagText,
                                        selectedTags.includes(tag) && styles.tagTextActive
                                    ]}
                                >
                                    #{tag}
                                </Typography>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Sort options */}
            <View style={styles.filterSection}>
                <Typography variant="body2" style={styles.filterTitle}>
                    Sort By
                </Typography>
                <View style={styles.sortContainer}>
                    <TouchableOpacity
                        style={[
                            styles.sortOption,
                            sort === 'newest' && styles.sortOptionActive
                        ]}
                        onPress={() => handleSortChange('newest')}
                    >
                        <Typography
                            color={sort === 'newest' ? 'primary' : 'secondary'}
                        >
                            Newest
                        </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sortOption,
                            sort === 'oldest' && styles.sortOptionActive
                        ]}
                        onPress={() => handleSortChange('oldest')}
                    >
                        <Typography
                            color={sort === 'oldest' ? 'primary' : 'secondary'}
                        >
                            Oldest
                        </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.sortOption,
                            sort === 'alphabetical' && styles.sortOptionActive
                        ]}
                        onPress={() => handleSortChange('alphabetical')}
                    >
                        <Typography
                            color={sort === 'alphabetical' ? 'primary' : 'secondary'}
                        >
                            A-Z
                        </Typography>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
});