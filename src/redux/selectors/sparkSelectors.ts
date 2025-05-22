import { RootState } from '../store';

export const selectSparks = (state: RootState) => state.spark.sparks;
export const selectSparkLoading = (state: RootState) => state.spark.loading;
export const selectSparkError = (state: RootState) => state.spark.error;

// Helper selector to get a specific spark by id
export const selectSparkById = (id: string) => (state: RootState) =>
    state.spark.sparks.find(spark => spark.id === id); 