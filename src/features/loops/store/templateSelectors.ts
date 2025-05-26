import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { TemplateState } from './templateSlice';
import { ActivityTemplate } from '../../../shared/types/loop';

// Base selectors
export const selectTemplateState = (state: RootState): TemplateState => state.templates;

export const selectTemplates = createSelector(
    [selectTemplateState],
    (templateState) => templateState.templates
);

export const selectSelectedTemplate = createSelector(
    [selectTemplateState],
    (templateState) => templateState.selectedTemplate
);

export const selectTemplateFilters = createSelector(
    [selectTemplateState],
    (templateState) => templateState.filters
);

export const selectTemplateLoading = createSelector(
    [selectTemplateState],
    (templateState) => templateState.isLoading
);

export const selectTemplateError = createSelector(
    [selectTemplateState],
    (templateState) => templateState.error
);

// Computed selectors
export const selectTemplateById = createSelector(
    [selectTemplates, (state: RootState, templateId: string) => templateId],
    (templates, templateId) => templates.find(template => template.id === templateId) || null
);

export const selectFilteredTemplates = createSelector(
    [selectTemplates, selectTemplateFilters],
    (templates, filters) => {
        let filteredTemplates = [...templates];

        // Search query filter
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase().trim();
            filteredTemplates = filteredTemplates.filter(template =>
                template.title.toLowerCase().includes(query) ||
                template.description?.toLowerCase().includes(query) ||
                template.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Type filter
        if (filters.type) {
            filteredTemplates = filteredTemplates.filter(template => template.type === filters.type);
        }

        // Category filter
        if (filters.category) {
            filteredTemplates = filteredTemplates.filter(template => template.category === filters.category);
        }

        // Tags filter
        if (filters.tags.length > 0) {
            filteredTemplates = filteredTemplates.filter(template =>
                template.tags?.some(tag => filters.tags.includes(tag))
            );
        }

        return filteredTemplates;
    }
);

export const selectBuiltInTemplates = createSelector(
    [selectTemplates],
    (templates) => templates.filter(template => template.isBuiltIn)
);

export const selectCustomTemplates = createSelector(
    [selectTemplates],
    (templates) => templates.filter(template => !template.isBuiltIn)
);

export const selectTemplatesByType = createSelector(
    [selectTemplates],
    (templates) => {
        const templatesByType: Record<string, ActivityTemplate[]> = {};

        templates.forEach(template => {
            if (!templatesByType[template.type]) {
                templatesByType[template.type] = [];
            }
            templatesByType[template.type].push(template);
        });

        // Sort templates within each type
        Object.keys(templatesByType).forEach(type => {
            templatesByType[type].sort((a, b) => a.title.localeCompare(b.title));
        });

        return templatesByType;
    }
);

export const selectTemplatesByCategory = createSelector(
    [selectTemplates],
    (templates) => {
        const templatesByCategory: Record<string, ActivityTemplate[]> = {};

        templates.forEach(template => {
            const category = template.category || 'Uncategorized';
            if (!templatesByCategory[category]) {
                templatesByCategory[category] = [];
            }
            templatesByCategory[category].push(template);
        });

        // Sort templates within each category
        Object.keys(templatesByCategory).forEach(category => {
            templatesByCategory[category].sort((a, b) => a.title.localeCompare(b.title));
        });

        return templatesByCategory;
    }
);

export const selectTemplateTypes = createSelector(
    [selectTemplates],
    (templates) => {
        const types = new Set<string>();
        templates.forEach(template => types.add(template.type));
        return Array.from(types).sort();
    }
);

export const selectTemplateCategories = createSelector(
    [selectTemplates],
    (templates) => {
        const categories = new Set<string>();
        templates.forEach(template => {
            if (template.category) {
                categories.add(template.category);
            }
        });
        return Array.from(categories).sort();
    }
);

export const selectTemplateTags = createSelector(
    [selectTemplates],
    (templates) => {
        const tags = new Set<string>();
        templates.forEach(template => {
            template.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }
);

export const selectTemplateStats = createSelector(
    [selectTemplates],
    (templates) => ({
        totalTemplates: templates.length,
        builtInTemplates: templates.filter(t => t.isBuiltIn).length,
        customTemplates: templates.filter(t => !t.isBuiltIn).length,
        averageDuration: templates.length > 0
            ? templates.reduce((sum, template) => sum + template.duration, 0) / templates.length
            : 0,
        shortTemplates: templates.filter(t => t.duration <= 300).length, // 5 minutes or less
        mediumTemplates: templates.filter(t => t.duration > 300 && t.duration <= 1800).length, // 5-30 minutes
        longTemplates: templates.filter(t => t.duration > 1800).length, // More than 30 minutes
        categorizedTemplates: templates.filter(t => t.category).length,
        taggedTemplates: templates.filter(t => t.tags && t.tags.length > 0).length,
    })
);

export const selectShortTemplates = createSelector(
    [selectTemplates],
    (templates) => templates.filter(template => template.duration <= 300) // 5 minutes or less
);

export const selectMediumTemplates = createSelector(
    [selectTemplates],
    (templates) => templates.filter(template => template.duration > 300 && template.duration <= 1800) // 5-30 minutes
);

export const selectLongTemplates = createSelector(
    [selectTemplates],
    (templates) => templates.filter(template => template.duration > 1800) // More than 30 minutes
);

export const selectRecentTemplates = createSelector(
    [selectTemplates],
    (templates) => {
        return templates
            .slice()
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
    }
);

export const selectPopularTemplates = createSelector(
    [selectTemplates],
    (templates) => {
        // For now, we'll sort by built-in status and then alphabetically
        // In a real app, you'd track usage statistics
        return templates
            .slice()
            .sort((a, b) => {
                if (a.isBuiltIn && !b.isBuiltIn) return -1;
                if (!a.isBuiltIn && b.isBuiltIn) return 1;
                return a.title.localeCompare(b.title);
            })
            .slice(0, 10);
    }
);

export const selectTemplatesForType = createSelector(
    [selectTemplates, (state: RootState, type: string) => type],
    (templates, type) => {
        return templates
            .filter(template => template.type === type)
            .sort((a, b) => a.title.localeCompare(b.title));
    }
);

export const selectTemplatesForCategory = createSelector(
    [selectTemplates, (state: RootState, category: string) => category],
    (templates, category) => {
        return templates
            .filter(template => template.category === category)
            .sort((a, b) => a.title.localeCompare(b.title));
    }
);

export const selectSimilarTemplates = createSelector(
    [selectTemplates, (state: RootState, templateId: string) => templateId],
    (templates, templateId) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return [];

        return templates
            .filter(t =>
                t.id !== templateId &&
                (t.type === template.type ||
                    t.category === template.category ||
                    t.tags?.some(tag => template.tags?.includes(tag)))
            )
            .sort((a, b) => {
                // Score based on similarity
                let scoreA = 0;
                let scoreB = 0;

                if (a.type === template.type) scoreA += 3;
                if (b.type === template.type) scoreB += 3;

                if (a.category === template.category) scoreA += 2;
                if (b.category === template.category) scoreB += 2;

                const aTagMatches = a.tags?.filter(tag => template.tags?.includes(tag)).length || 0;
                const bTagMatches = b.tags?.filter(tag => template.tags?.includes(tag)).length || 0;
                scoreA += aTagMatches;
                scoreB += bTagMatches;

                return scoreB - scoreA;
            })
            .slice(0, 5);
    }
);

// Utility selectors
export const selectHasTemplates = createSelector(
    [selectTemplates],
    (templates) => templates.length > 0
);

export const selectHasCustomTemplates = createSelector(
    [selectCustomTemplates],
    (customTemplates) => customTemplates.length > 0
);

export const selectHasTemplateFilters = createSelector(
    [selectTemplateFilters],
    (filters) => {
        return !!(
            filters.searchQuery.trim() ||
            filters.type ||
            filters.category ||
            filters.tags.length > 0
        );
    }
);

export const selectIsTemplateFiltered = createSelector(
    [selectTemplates, selectFilteredTemplates],
    (allTemplates, filteredTemplates) => allTemplates.length !== filteredTemplates.length
);

export const selectTemplateLoadingState = createSelector(
    [selectTemplateLoading, selectTemplateError],
    (isLoading, error) => ({
        isLoading,
        hasError: !!error,
        error,
    })
); 