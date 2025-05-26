// src/types/note.ts
import { BaseEntry } from './baseEntry';

export interface Note extends BaseEntry {
    type: 'note';
    title: string;
    body?: string;
}