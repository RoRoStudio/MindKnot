import React, { useState } from 'react';
import { View, ScrollView, Modal } from 'react-native';
import { useForm } from 'react-hook-form';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Button,
    FormInput,
    FormSelect,
    FormSwitch,
    Card,
    Icon
} from '../../../shared/components';
import { StyleProps } from '../../../shared/components/shared-props';

export interface LoopFilters {
    searchQuery?: string;
    category?: string;
    tags?: string[];
    minDuration?: number;
    maxDuration?: number;
    hasActivities?: boolean;
    isRepeatable?: boolean;
    sortBy?: 'title' | 'createdAt' | 'duration' | 'lastUsed';
    sortOrder?: 'asc' | 'desc';
}

export interface LoopFiltersModalProps extends StyleProps {
    /**
     * Whether the modal is visible
     */
    visible: boolean;

    /**
     * Current filter values
     */
    filters: LoopFilters;

    /**
     * Callback when filters are applied
     */
    onApplyFilters: (filters: LoopFilters) => void;

    /**
     * Callback when modal is closed
     */
    onClose: () => void;

    /**
     * Callback to reset filters
     */
    onResetFilters: () => void;

    /**
     * Available categories for filtering
     */
    availableCategories?: string[];

    /**
     * Available tags for filtering
     */
    availableTags?: string[];
}

/**
 * LoopFiltersModal component provides filtering and sorting options for loops
 * 
 * @example
 * ```tsx
 * <LoopFiltersModal
 *   visible={showFilters}
 *   filters={currentFilters}
 *   onApplyFilters={handleApplyFilters}
 *   onClose={handleCloseFilters}
 *   onResetFilters={handleResetFilters}
 * />
 * ```
 */
export const LoopFiltersModal: React.FC<LoopFiltersModalProps> = ({
    visible,
    filters,
    onApplyFilters,
    onClose,
    onResetFilters,
    availableCategories = [],
    availableTags = [],
    style,
}) => {
    const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);

    const { control, handleSubmit, reset, watch, formState: { isDirty } } = useForm<LoopFilters>({
        defaultValues: filters,
        mode: 'onChange',
    });

    const styles = useThemedStyles((theme) => ({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.shape.radius.l,
            borderTopRightRadius: theme.shape.radius.l,
            maxHeight: '90%',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerTitle: {
            fontSize: theme.typography.fontSize.l,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
        },
        closeButton: {
            padding: theme.spacing.s,
        },
        scrollContainer: {
            flex: 1,
            padding: theme.spacing.m,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            marginBottom: theme.spacing.s,
        },
        formRow: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        formColumn: {
            flex: 1,
        },
        tagContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.s,
            marginTop: theme.spacing.s,
        },
        tag: {
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            borderRadius: theme.shape.radius.s,
            borderWidth: 1,
        },
        tagSelected: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        tagUnselected: {
            backgroundColor: 'transparent',
            borderColor: theme.colors.border,
        },
        tagText: {
            fontSize: theme.typography.fontSize.s,
        },
        tagTextSelected: {
            color: theme.colors.surface,
            fontWeight: theme.typography.fontWeight.medium,
        },
        tagTextUnselected: {
            color: theme.colors.textSecondary,
        },
        durationContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.s,
        },
        durationInput: {
            flex: 1,
        },
        durationSeparator: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            paddingHorizontal: theme.spacing.s,
        },
        actionButtons: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            padding: theme.spacing.m,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        actionButton: {
            flex: 1,
        },
        resetButton: {
            alignSelf: 'flex-start',
        },
        filterCount: {
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            marginLeft: theme.spacing.s,
        },
        filterCountText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.surface,
            fontWeight: theme.typography.fontWeight.bold,
        },
    }));

    const categoryOptions = [
        { label: 'All Categories', value: '' },
        ...availableCategories.map(cat => ({ label: cat, value: cat })),
    ];

    const sortByOptions = [
        { label: 'Title', value: 'title' },
        { label: 'Created Date', value: 'createdAt' },
        { label: 'Duration', value: 'duration' },
        { label: 'Last Used', value: 'lastUsed' },
    ];

    const sortOrderOptions = [
        { label: 'Ascending', value: 'asc' },
        { label: 'Descending', value: 'desc' },
    ];

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        return minutes > 0 ? `${minutes}m` : `${seconds}s`;
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const getActiveFilterCount = (): number => {
        let count = 0;
        if (filters.searchQuery) count++;
        if (filters.category) count++;
        if (filters.tags && filters.tags.length > 0) count++;
        if (filters.minDuration !== undefined) count++;
        if (filters.maxDuration !== undefined) count++;
        if (filters.hasActivities !== undefined) count++;
        if (filters.isRepeatable !== undefined) count++;
        return count;
    };

    const onSubmit = (data: LoopFilters) => {
        const filtersToApply: LoopFilters = {
            ...data,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            searchQuery: data.searchQuery?.trim() || undefined,
            category: data.category || undefined,
        };

        onApplyFilters(filtersToApply);
        onClose();
    };

    const handleReset = () => {
        reset({
            searchQuery: '',
            category: '',
            tags: [],
            minDuration: undefined,
            maxDuration: undefined,
            hasActivities: undefined,
            isRepeatable: undefined,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
        setSelectedTags([]);
        onResetFilters();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, style]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Typography style={styles.headerTitle}>
                                Filters
                            </Typography>
                            {getActiveFilterCount() > 0 && (
                                <View style={styles.filterCount}>
                                    <Typography style={styles.filterCountText}>
                                        {getActiveFilterCount()}
                                    </Typography>
                                </View>
                            )}
                        </View>

                        <Button
                            variant="ghost"
                            size="small"
                            leftIcon="x"
                            label=""
                            onPress={onClose}
                            style={styles.closeButton}
                        />
                    </View>

                    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                        {/* Search */}
                        <Card style={styles.section}>
                            <Typography variant="h4" style={styles.sectionTitle}>
                                Search
                            </Typography>

                            <FormInput
                                name="searchQuery"
                                control={control}
                                label="Search Query"
                                placeholder="Search loops by title or description"
                                leftIcon="search"
                            />
                        </Card>

                        {/* Category & Tags */}
                        <Card style={styles.section}>
                            <Typography variant="h4" style={styles.sectionTitle}>
                                Category & Tags
                            </Typography>

                            <FormSelect
                                name="category"
                                control={control}
                                label="Category"
                                options={categoryOptions}
                                placeholder="Select category"
                            />

                            {availableTags.length > 0 && (
                                <>
                                    <Typography variant="body2" style={{ marginTop: theme.spacing.m, marginBottom: theme.spacing.s }}>
                                        Tags
                                    </Typography>
                                    <View style={styles.tagContainer}>
                                        {availableTags.map((tag) => (
                                            <Button
                                                key={tag}
                                                variant="ghost"
                                                size="small"
                                                label={tag}
                                                onPress={() => toggleTag(tag)}
                                                style={[
                                                    styles.tag,
                                                    selectedTags.includes(tag) ? styles.tagSelected : styles.tagUnselected,
                                                ]}
                                                textStyle={[
                                                    styles.tagText,
                                                    selectedTags.includes(tag) ? styles.tagTextSelected : styles.tagTextUnselected,
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </>
                            )}
                        </Card>

                        {/* Duration */}
                        <Card style={styles.section}>
                            <Typography variant="h4" style={styles.sectionTitle}>
                                Duration Range
                            </Typography>

                            <View style={styles.durationContainer}>
                                <View style={styles.durationInput}>
                                    <FormInput
                                        name="minDuration"
                                        control={control}
                                        label="Min Duration (seconds)"
                                        placeholder="0"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <Typography style={styles.durationSeparator}>to</Typography>

                                <View style={styles.durationInput}>
                                    <FormInput
                                        name="maxDuration"
                                        control={control}
                                        label="Max Duration (seconds)"
                                        placeholder="3600"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </Card>

                        {/* Properties */}
                        <Card style={styles.section}>
                            <Typography variant="h4" style={styles.sectionTitle}>
                                Properties
                            </Typography>

                            <FormSwitch
                                name="hasActivities"
                                control={control}
                                label="Has Activities"
                                helperText="Only show loops with activities"
                            />

                            <FormSwitch
                                name="isRepeatable"
                                control={control}
                                label="Repeatable"
                                helperText="Only show repeatable loops"
                            />
                        </Card>

                        {/* Sorting */}
                        <Card style={styles.section}>
                            <Typography variant="h4" style={styles.sectionTitle}>
                                Sorting
                            </Typography>

                            <View style={styles.formRow}>
                                <View style={styles.formColumn}>
                                    <FormSelect
                                        name="sortBy"
                                        control={control}
                                        label="Sort By"
                                        options={sortByOptions}
                                    />
                                </View>

                                <View style={styles.formColumn}>
                                    <FormSelect
                                        name="sortOrder"
                                        control={control}
                                        label="Order"
                                        options={sortOrderOptions}
                                    />
                                </View>
                            </View>
                        </Card>

                        {/* Reset Button */}
                        <Button
                            variant="outline"
                            size="small"
                            label="Reset All Filters"
                            leftIcon="refresh-cw"
                            onPress={handleReset}
                            style={styles.resetButton}
                        />
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <Button
                            variant="secondary"
                            label="Cancel"
                            onPress={onClose}
                            style={styles.actionButton}
                        />
                        <Button
                            variant="primary"
                            label="Apply Filters"
                            onPress={handleSubmit(onSubmit)}
                            style={styles.actionButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}; 