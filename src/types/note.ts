// src/types/note.ts
import { BaseEntry } from './baseEntry';

export interface Note extends BaseEntry {
    type: 'note';
    body: string;
}