// src/types/spark.ts
import { BaseEntry } from './baseEntry';

export interface Spark extends BaseEntry {
    type: 'spark';
    title: string;
    body?: string;
    linkedEntryIds?: string[];
}