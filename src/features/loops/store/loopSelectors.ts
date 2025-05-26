import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { LoopState } from './loopSlice';
import { Loop } from '../../../shared/types/loop';

// Base selectors
export const selectLoopState = (state: RootState): LoopState => state.loops;

export const selectLoops = createSelector(
    [selectLoopState],
    (loopState) => loopState.loops
);

export const selectSelectedLoop = createSelector(
    [selectLoopState],
    (loopState) => loopState.selectedLoop
);

export const selectLoopFilters = createSelector(
    [selectLoopState],
    (loopState) => loopState.filters
);

export const selectLoopPagination = createSelector(
    [selectLoopState],
    (loopState) => loopState.pagination
);

export const selectLoopLoading = createSelector(
    [selectLoopState],
    (loopState) => loopState.isLoading
);

export const selectLoopError = createSelector(
    [selectLoopState],
    (loopState) => loopState.error
);

// Computed selectors
export const selectLoopById = createSelector(
    [selectLoops, (state: RootState, loopId: string) => loopId],
    (loops, loopId) => loops.find(loop => loop.id === loopId) || null
);

export const selectFilteredLoops = createSelector(
    [selectLoops, selectLoopFilters],
    (loops, filters) => {
        let filteredLoops = [...loops];

        // Search query filter
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase().trim();
            filteredLoops = filteredLoops.filter(loop =>
                loop.title.toLowerCase().includes(query) ||
                loop.description?.toLowerCase().includes(query) ||
                loop.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (filters.category) {
            filteredLoops = filteredLoops.filter(loop => loop.category === filters.category);
        }

        // Tags filter
        if (filters.tags.length > 0) {
            filteredLoops = filteredLoops.filter(loop =>
                loop.tags?.some(tag => filters.tags.includes(tag))
            );
        }

        return filteredLoops;
    }
);

export const selectSortedLoops = createSelector(
    [selectFilteredLoops, selectLoopFilters],
    (loops, filters) => {
        const sortedLoops = [...loops];

        sortedLoops.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'createdAt':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'duration':
                    const aDuration = a.activities.reduce((sum, activity) => sum + activity.duration, 0);
                    const bDuration = b.activities.reduce((sum, activity) => sum + activity.duration, 0);
                    comparison = aDuration - bDuration;
                    break;
                case 'lastUsed':
                    const aLastUsed = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
                    const bLastUsed = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
                    comparison = aLastUsed - bLastUsed;
                    break;
                default:
                    comparison = 0;
            }

            return filters.sortOrder === 'desc' ? -comparison : comparison;
        });

        return sortedLoops;
    }
);

export const selectLoopCategories = createSelector(
    [selectLoops],
    (loops) => {
        const categories = new Set<string>();
        loops.forEach(loop => {
            if (loop.category) {
                categories.add(loop.category);
            }
        });
        return Array.from(categories).sort();
    }
);

export const selectLoopTags = createSelector(
    [selectLoops],
    (loops) => {
        const tags = new Set<string>();
        loops.forEach(loop => {
            loop.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }
);

export const selectLoopStats = createSelector(
    [selectLoops],
    (loops) => ({
        totalLoops: loops.length,
        totalActivities: loops.reduce((sum, loop) => sum + loop.activities.length, 0),
        averageActivitiesPerLoop: loops.length > 0
            ? loops.reduce((sum, loop) => sum + loop.activities.length, 0) / loops.length
            : 0,
        totalDuration: loops.reduce((sum, loop) =>
            sum + loop.activities.reduce((actSum, activity) => actSum + activity.duration, 0), 0
        ),
        averageDuration: loops.length > 0
            ? loops.reduce((sum, loop) =>
                sum + loop.activities.reduce((actSum, activity) => actSum + activity.duration, 0), 0
            ) / loops.length
            : 0,
        repeatableLoops: loops.filter(loop => loop.isRepeatable).length,
        categorizedLoops: loops.filter(loop => loop.category).length,
        taggedLoops: loops.filter(loop => loop.tags && loop.tags.length > 0).length,
    })
);

export const selectRecentLoops = createSelector(
    [selectLoops],
    (loops) => {
        return loops
            .filter(loop => loop.lastUsedAt)
            .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())
            .slice(0, 5);
    }
);

export const selectFavoriteLoops = createSelector(
    [selectLoops],
    (loops) => {
        return loops
            .filter(loop => loop.isFavorite)
            .sort((a, b) => a.title.localeCompare(b.title));
    }
);

export const selectLoopsByCategory = createSelector(
    [selectLoops],
    (loops) => {
        const loopsByCategory: Record<string, Loop[]> = {};

        loops.forEach(loop => {
            const category = loop.category || 'Uncategorized';
            if (!loopsByCategory[category]) {
                loopsByCategory[category] = [];
            }
            loopsByCategory[category].push(loop);
        });

        // Sort loops within each category
        Object.keys(loopsByCategory).forEach(category => {
            loopsByCategory[category].sort((a, b) => a.title.localeCompare(b.title));
        });

        return loopsByCategory;
    }
);

export const selectLoopsByTag = createSelector(
    [selectLoops],
    (loops) => {
        const loopsByTag: Record<string, Loop[]> = {};

        loops.forEach(loop => {
            if (loop.tags) {
                loop.tags.forEach(tag => {
                    if (!loopsByTag[tag]) {
                        loopsByTag[tag] = [];
                    }
                    loopsByTag[tag].push(loop);
                });
            }
        });

        // Sort loops within each tag
        Object.keys(loopsByTag).forEach(tag => {
            loopsByTag[tag].sort((a, b) => a.title.localeCompare(b.title));
        });

        return loopsByTag;
    }
);

export const selectLoopDurations = createSelector(
    [selectLoops],
    (loops) => {
        return loops.map(loop => ({
            id: loop.id,
            title: loop.title,
            duration: loop.activities.reduce((sum, activity) => sum + activity.duration, 0),
            activityCount: loop.activities.length,
        }));
    }
);

export const selectShortLoops = createSelector(
    [selectLoops],
    (loops) => {
        return loops.filter(loop => {
            const totalDuration = loop.activities.reduce((sum, activity) => sum + activity.duration, 0);
            return totalDuration <= 900; // 15 minutes or less
        });
    }
);

export const selectMediumLoops = createSelector(
    [selectLoops],
    (loops) => {
        return loops.filter(loop => {
            const totalDuration = loop.activities.reduce((sum, activity) => sum + activity.duration, 0);
            return totalDuration > 900 && totalDuration <= 3600; // 15 minutes to 1 hour
        });
    }
);

export const selectLongLoops = createSelector(
    [selectLoops],
    (loops) => {
        return loops.filter(loop => {
            const totalDuration = loop.activities.reduce((sum, activity) => sum + activity.duration, 0);
            return totalDuration > 3600; // More than 1 hour
        });
    }
);

export const selectLoopsWithoutActivities = createSelector(
    [selectLoops],
    (loops) => {
        return loops.filter(loop => loop.activities.length === 0);
    }
);

export const selectIncompleteLoops = createSelector(
    [selectLoops],
    (loops) => {
        return loops.filter(loop =>
            !loop.title.trim() ||
            loop.activities.length === 0 ||
            loop.activities.some(activity => !activity.title.trim() || activity.duration <= 0)
        );
    }
);

// Utility selectors for UI state
export const selectHasLoops = createSelector(
    [selectLoops],
    (loops) => loops.length > 0
);

export const selectHasFilters = createSelector(
    [selectLoopFilters],
    (filters) => {
        return !!(
            filters.searchQuery.trim() ||
            filters.category ||
            filters.tags.length > 0
        );
    }
);

export const selectIsFiltered = createSelector(
    [selectLoops, selectFilteredLoops],
    (allLoops, filteredLoops) => allLoops.length !== filteredLoops.length
);

export const selectCanLoadMore = createSelector(
    [selectLoopPagination],
    (pagination) => pagination.hasMore
);

export const selectLoadingState = createSelector(
    [selectLoopLoading, selectLoopError],
    (isLoading, error) => ({
        isLoading,
        hasError: !!error,
        error,
    })
); 