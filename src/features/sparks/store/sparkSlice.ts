// src/redux/slices/sparkSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Spark } from '../../../shared/types/spark';
import { getAllSparks, createSpark, updateSpark, deleteSpark } from '../hooks/useSparkService';

interface SparkState {
    sparks: Spark[];
    loading: boolean;
    error: string | null;
}

const initialState: SparkState = {
    sparks: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchSparks = createAsyncThunk(
    'sparks/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await getAllSparks();
        } catch (error) {
            console.error('Failed to load sparks:', error);
            return rejectWithValue('Failed to load sparks');
        }
    }
);

export const addSpark = createAsyncThunk(
    'sparks/add',
    async (spark: Omit<Spark, 'id' | 'type' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
        try {
            return await createSpark(spark);
        } catch (error) {
            console.error('Failed to create spark:', error);
            return rejectWithValue('Failed to create spark');
        }
    }
);

export const updateSparkThunk = createAsyncThunk(
    'sparks/update',
    async ({ id, updates }: { id: string; updates: Partial<Omit<Spark, 'id' | 'type' | 'createdAt' | 'updatedAt'>> }, { rejectWithValue }) => {
        try {
            const success = await updateSpark(id, updates);
            if (success) {
                return { id, updates };
            }
            return rejectWithValue('Failed to update spark');
        } catch (error) {
            console.error('Failed to update spark:', error);
            return rejectWithValue('Failed to update spark');
        }
    }
);

export const removeSpark = createAsyncThunk(
    'sparks/remove',
    async (id: string, { rejectWithValue }) => {
        try {
            const success = await deleteSpark(id);
            if (success) {
                return id;
            }
            return rejectWithValue('Failed to delete spark');
        } catch (error) {
            console.error('Failed to delete spark:', error);
            return rejectWithValue('Failed to delete spark');
        }
    }
);

const sparkSlice = createSlice({
    name: 'spark',
    initialState,
    reducers: {
        setSparks: (state, action: PayloadAction<Spark[]>) => {
            state.sparks = action.payload;
        },
        clearSparks: (state) => {
            state.sparks = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all sparks
            .addCase(fetchSparks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSparks.fulfilled, (state, action) => {
                state.sparks = action.payload;
                state.loading = false;
            })
            .addCase(fetchSparks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add spark
            .addCase(addSpark.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addSpark.fulfilled, (state, action) => {
                state.sparks.unshift(action.payload as Spark);
                state.loading = false;
            })
            .addCase(addSpark.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update spark
            .addCase(updateSparkThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSparkThunk.fulfilled, (state, action) => {
                const { id, updates } = action.payload as { id: string; updates: Partial<Spark> };
                state.sparks = state.sparks.map(spark =>
                    spark.id === id ? { ...spark, ...updates } : spark
                );
                state.loading = false;
            })
            .addCase(updateSparkThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Remove spark
            .addCase(removeSpark.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeSpark.fulfilled, (state, action) => {
                state.sparks = state.sparks.filter(spark => spark.id !== action.payload);
                state.loading = false;
            })
            .addCase(removeSpark.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSparks, clearSparks } = sparkSlice.actions;

export default sparkSlice.reducer; 