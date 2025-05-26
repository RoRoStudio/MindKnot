import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ActivityTemplate } from '../../../shared/types/loop';

export interface TemplateState {
    templates: ActivityTemplate[];
    selectedTemplate: ActivityTemplate | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        searchQuery: string;
        type: string | null;
        tags: string[];
        category: string | null;
    };
}

const initialState: TemplateState = {
    templates: [],
    selectedTemplate: null,
    isLoading: false,
    error: null,
    filters: {
        searchQuery: '',
        type: null,
        tags: [],
        category: null,
    },
};

// Async thunks for template operations
export const fetchTemplates = createAsyncThunk(
    'templates/fetchTemplates',
    async (filters?: Partial<TemplateState['filters']>) => {
        // This would integrate with your actual template service
        const response = await new Promise<ActivityTemplate[]>((resolve) => {
            setTimeout(() => {
                // Mock templates - would be loaded from service
                const mockTemplates: ActivityTemplate[] = [
                    {
                        id: 'template_1',
                        title: 'Focus Session',
                        description: 'Deep work session with minimal distractions',
                        type: 'focus',
                        duration: 1500, // 25 minutes
                        instructions: 'Turn off notifications, close unnecessary tabs, and focus on a single task.',
                        tags: ['productivity', 'focus', 'pomodoro'],
                        category: 'work',
                        isBuiltIn: true,
                        createdAt: new Date('2024-01-01'),
                        updatedAt: new Date('2024-01-01'),
                    },
                    {
                        id: 'template_2',
                        title: 'Short Break',
                        description: 'Quick break to rest and recharge',
                        type: 'break',
                        duration: 300, // 5 minutes
                        instructions: 'Step away from your workspace, stretch, or take a few deep breaths.',
                        tags: ['break', 'rest', 'pomodoro'],
                        category: 'wellness',
                        isBuiltIn: true,
                        createdAt: new Date('2024-01-01'),
                        updatedAt: new Date('2024-01-01'),
                    },
                    {
                        id: 'template_3',
                        title: 'Meditation',
                        description: 'Mindfulness meditation session',
                        type: 'meditation',
                        duration: 600, // 10 minutes
                        instructions: 'Find a quiet space, sit comfortably, and focus on your breath.',
                        tags: ['meditation', 'mindfulness', 'wellness'],
                        category: 'wellness',
                        isBuiltIn: true,
                        createdAt: new Date('2024-01-01'),
                        updatedAt: new Date('2024-01-01'),
                    },
                    {
                        id: 'template_4',
                        title: 'Exercise',
                        description: 'Physical activity session',
                        type: 'exercise',
                        duration: 900, // 15 minutes
                        instructions: 'Do some light exercises, stretching, or a quick workout.',
                        tags: ['exercise', 'fitness', 'health'],
                        category: 'fitness',
                        isBuiltIn: true,
                        createdAt: new Date('2024-01-01'),
                        updatedAt: new Date('2024-01-01'),
                    },
                ];
                resolve(mockTemplates);
            }, 100);
        });
        return response;
    }
);

export const createTemplate = createAsyncThunk(
    'templates/createTemplate',
    async (templateData: Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>) => {
        const newTemplate: ActivityTemplate = {
            ...templateData,
            id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isBuiltIn: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // This would integrate with your actual template service
        await new Promise(resolve => setTimeout(resolve, 100));

        return newTemplate;
    }
);

export const updateTemplate = createAsyncThunk(
    'templates/updateTemplate',
    async ({ id, updates }: { id: string; updates: Partial<ActivityTemplate> }) => {
        const updatedTemplate = {
            ...updates,
            id,
            updatedAt: new Date(),
        };

        // This would integrate with your actual template service
        await new Promise(resolve => setTimeout(resolve, 100));

        return updatedTemplate;
    }
);

export const deleteTemplate = createAsyncThunk(
    'templates/deleteTemplate',
    async (id: string, { getState }) => {
        const state = getState() as { templates: TemplateState };
        const template = state.templates.templates.find(t => t.id === id);

        if (template?.isBuiltIn) {
            throw new Error('Cannot delete built-in templates');
        }

        // This would integrate with your actual template service
        await new Promise(resolve => setTimeout(resolve, 100));

        return id;
    }
);

export const duplicateTemplate = createAsyncThunk(
    'templates/duplicateTemplate',
    async (id: string, { getState }) => {
        const state = getState() as { templates: TemplateState };
        const originalTemplate = state.templates.templates.find(template => template.id === id);

        if (!originalTemplate) {
            throw new Error('Template not found');
        }

        const duplicatedTemplate: ActivityTemplate = {
            ...originalTemplate,
            id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `${originalTemplate.title} (Copy)`,
            isBuiltIn: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // This would integrate with your actual template service
        await new Promise(resolve => setTimeout(resolve, 100));

        return duplicatedTemplate;
    }
);

const templateSlice = createSlice({
    name: 'templates',
    initialState,
    reducers: {
        setSelectedTemplate: (state, action: PayloadAction<ActivityTemplate | null>) => {
            state.selectedTemplate = action.payload;
        },

        setTemplateFilters: (state, action: PayloadAction<Partial<TemplateState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        clearTemplateFilters: (state) => {
            state.filters = initialState.filters;
        },

        clearTemplateError: (state) => {
            state.error = null;
        },

        resetTemplateState: () => initialState,
    },

    extraReducers: (builder) => {
        builder
            // Fetch templates
            .addCase(fetchTemplates.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTemplates.fulfilled, (state, action) => {
                state.isLoading = false;
                state.templates = action.payload;
            })
            .addCase(fetchTemplates.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch templates';
            })

            // Create template
            .addCase(createTemplate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createTemplate.fulfilled, (state, action) => {
                state.isLoading = false;
                state.templates.unshift(action.payload);
            })
            .addCase(createTemplate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to create template';
            })

            // Update template
            .addCase(updateTemplate.pending, (state) => {
                state.error = null;
            })
            .addCase(updateTemplate.fulfilled, (state, action) => {
                const index = state.templates.findIndex(template => template.id === action.payload.id);
                if (index !== -1) {
                    state.templates[index] = { ...state.templates[index], ...action.payload };
                }

                if (state.selectedTemplate?.id === action.payload.id) {
                    state.selectedTemplate = { ...state.selectedTemplate, ...action.payload };
                }
            })
            .addCase(updateTemplate.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to update template';
            })

            // Delete template
            .addCase(deleteTemplate.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteTemplate.fulfilled, (state, action) => {
                state.templates = state.templates.filter(template => template.id !== action.payload);

                if (state.selectedTemplate?.id === action.payload) {
                    state.selectedTemplate = null;
                }
            })
            .addCase(deleteTemplate.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete template';
            })

            // Duplicate template
            .addCase(duplicateTemplate.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(duplicateTemplate.fulfilled, (state, action) => {
                state.isLoading = false;
                state.templates.unshift(action.payload);
            })
            .addCase(duplicateTemplate.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to duplicate template';
            });
    },
});

export const {
    setSelectedTemplate,
    setTemplateFilters,
    clearTemplateFilters,
    clearTemplateError,
    resetTemplateState,
} = templateSlice.actions;

export default templateSlice.reducer; 