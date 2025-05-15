// src/types/spark.ts
import { BaseEntry } from './baseEntry';

export interface Spark extends BaseEntry {
    type: 'spark';
    body: string;
    linkedEntryIds?: string[]; // Can be linked to Actions, Milestones, Loop Items
}