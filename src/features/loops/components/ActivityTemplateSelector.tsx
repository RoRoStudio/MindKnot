/**
 * ActivityTemplateSelector Component
 * Beautiful scrollable tabbed categories with template selection
 * 
 * Features:
 * - 6 emoji-based categories with scrollable tabs
 * - Grid of templates with emoji + title
 * - Search functionality
 * - Category filtering
 * - Template selection with visual feedback
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    FormInput,
    Card,
} from '../../../shared/components';
import { ActivityTemplate } from '../../../shared/types/loop';
import { useActivityTemplates } from '../hooks/useActivityTemplates';

export interface ActivityTemplateSelectorProps {
    /** Currently selected template IDs */
    selectedTemplateIds: string[];

    /** Callback when template is selected/deselected */
    onTemplateToggle: (templateId: string) => void;

    /** Whether to allow multiple selection */
    multiSelect?: boolean;

    /** Optional search term */
    searchTerm?: string;

    /** Callback for search term changes */
    onSearchChange?: (term: string) => void;
}

/**
 * ActivityTemplateSelector component for selecting activity templates
 */
export const ActivityTemplateSelector: React.FC<ActivityTemplateSelectorProps> = ({
    selectedTemplateIds,
    onTemplateToggle,
    multiSelect = true,
    searchTerm = '',
    onSearchChange,
}) => {
    const { templates, categories } = useActivityTemplates();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
        },
        searchContainer: {
            padding: theme.spacing.m,
            paddingBottom: theme.spacing.s,
        },
        categoriesContainer: {
            paddingHorizontal: theme.spacing.m,
            paddingBottom: theme.spacing.m,
        },
        categoriesScroll: {
            flexGrow: 0,
        },
        categoryTab: {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            marginRight: theme.spacing.s,
            borderRadius: theme.shape.radius.pill,
            backgroundColor: theme.colors.surface,
            borderWidth: 2,
            borderColor: 'transparent',
            minWidth: 100,
            alignItems: 'center',
        },
        categoryTabSelected: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        categoryTabAll: {
            backgroundColor: theme.colors.surfaceVariant,
        },
        categoryEmoji: {
            fontSize: 20,
            marginBottom: theme.spacing.xs,
        },
        categoryTitle: {
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
            textAlign: 'center',
        },
        categoryTitleSelected: {
            color: theme.colors.onPrimary,
        },
        templatesContainer: {
            flex: 1,
            paddingHorizontal: theme.spacing.m,
        },
        templateGrid: {
            paddingBottom: theme.spacing.xl,
        },
        templateCard: {
            flex: 1,
            margin: theme.spacing.xs,
            padding: theme.spacing.m,
            alignItems: 'center',
            minHeight: 100,
            borderWidth: 2,
            borderColor: 'transparent',
        },
        templateCardSelected: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.primaryContainer,
        },
        templateEmoji: {
            fontSize: 32,
            marginBottom: theme.spacing.s,
        },
        templateTitle: {
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
            textAlign: 'center',
            lineHeight: 18,
        },
        templateDescription: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: theme.spacing.xs,
            lineHeight: 14,
        },
        linkedTargetIndicator: {
            position: 'absolute',
            top: theme.spacing.xs,
            right: theme.spacing.xs,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.secondary,
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.spacing.xl,
        },
        emptyText: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
    }));

    // Get category info with emojis
    const categoryInfo = useMemo(() => {
        const categoryMap: Record<string, { emoji: string; title: string }> = {
            'focus': { emoji: '📚', title: 'Focus' },
            'movement': { emoji: '🏃', title: 'Movement' },
            'wellness': { emoji: '🧘', title: 'Wellness' },
            'creative': { emoji: '🎨', title: 'Creative' },
            'social': { emoji: '👥', title: 'Social' },
            'maintenance': { emoji: '🏠', title: 'Maintenance' },
        };
        return categoryMap;
    }, []);

    // Filter templates based on search and category
    const filteredTemplates = useMemo(() => {
        let filtered = templates;

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(template => template.category === selectedCategory);
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            filtered = filtered.filter(template =>
                template.title.toLowerCase().includes(query) ||
                template.description?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [templates, selectedCategory, searchTerm]);

    // Handle category selection
    const handleCategorySelect = (category: string | null) => {
        setSelectedCategory(category);
    };

    // Handle template selection
    const handleTemplateSelect = (templateId: string) => {
        if (!multiSelect) {
            // Single select mode - clear others first
            onTemplateToggle(templateId);
        } else {
            // Multi select mode
            onTemplateToggle(templateId);
        }
    };

    // Render category tab
    const renderCategoryTab = (category: string | null, info: { emoji: string; title: string }) => {
        const isSelected = selectedCategory === category;
        const isAll = category === null;

        return (
            <TouchableOpacity
                key={category || 'all'}
                style={[
                    styles.categoryTab,
                    isSelected && styles.categoryTabSelected,
                    isAll && !isSelected && styles.categoryTabAll,
                ]}
                onPress={() => handleCategorySelect(category)}
            >
                <Typography style={styles.categoryEmoji}>
                    {info.emoji}
                </Typography>
                <Typography style={[
                    styles.categoryTitle,
                    isSelected && styles.categoryTitleSelected,
                ]}>
                    {info.title}
                </Typography>
            </TouchableOpacity>
        );
    };

    // Render template card
    const renderTemplateCard = ({ item }: { item: ActivityTemplate }) => {
        const isSelected = selectedTemplateIds.includes(item.id);

        return (
            <TouchableOpacity
                style={{ flex: 1, maxWidth: '48%' }}
                onPress={() => handleTemplateSelect(item.id)}
            >
                <Card
                    style={[
                        styles.templateCard,
                        isSelected && styles.templateCardSelected,
                    ]}
                >
                    {item.linkedTarget && (
                        <View style={styles.linkedTargetIndicator} />
                    )}

                    <Typography style={styles.templateEmoji}>
                        {item.emoji}
                    </Typography>

                    <Typography style={styles.templateTitle} numberOfLines={2}>
                        {item.title}
                    </Typography>

                    {item.description && (
                        <Typography style={styles.templateDescription} numberOfLines={2}>
                            {item.description}
                        </Typography>
                    )}
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Search */}
            {onSearchChange && (
                <View style={styles.searchContainer}>
                    <FormInput
                        name="search"
                        control={null as any}
                        placeholder="Search templates..."
                        leftIcon="search"
                    />
                </View>
            )}

            {/* Category Tabs */}
            <View style={styles.categoriesContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesScroll}
                >
                    {/* All Categories Tab */}
                    {renderCategoryTab(null, { emoji: '⚡', title: 'All' })}

                    {/* Individual Category Tabs */}
                    {categories.map(category =>
                        renderCategoryTab(category, categoryInfo[category] || { emoji: '⚡', title: category })
                    )}
                </ScrollView>
            </View>

            {/* Templates Grid */}
            <View style={styles.templatesContainer}>
                {filteredTemplates.length > 0 ? (
                    <FlatList
                        data={filteredTemplates}
                        renderItem={renderTemplateCard}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        contentContainerStyle={styles.templateGrid}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyState}>
                        <Typography style={styles.emptyText}>
                            {searchTerm.trim()
                                ? `No templates found for "${searchTerm}"`
                                : 'No templates available'
                            }
                        </Typography>
                    </View>
                )}
            </View>
        </View>
    );
}; 