// src/constants/entryTypes.ts
import { IconName } from '../components/common';

export enum EntryType {
    NOTE = 'Note',
    SPARK = 'Spark',
    ACTION = 'Action',
    PATH = 'Path',
    LOOP = 'Loop'
}

export type EntryTypeConfig = {
    type: EntryType;
    label: string;
    icon: IconName;
    pluralLabel: string;
    showInVault: boolean;
    showInMomentum: boolean;
    color: string;
};

export const ENTRY_TYPES: Record<EntryType, EntryTypeConfig> = {
    [EntryType.NOTE]: {
        type: EntryType.NOTE,
        label: 'Note',
        pluralLabel: 'Notes',
        icon: 'scroll-text',
        showInVault: true,
        showInMomentum: false,
        color: '#E11D48' // Vibrant Red-Pink - attention-grabbing for important notes
    },
    [EntryType.SPARK]: {
        type: EntryType.SPARK,
        label: 'Spark',
        pluralLabel: 'Sparks',
        icon: 'zap',
        showInVault: true,
        showInMomentum: true,
        color: '#F59E0B' // Vibrant Amber - energetic like inspiration and ideas
    },
    [EntryType.ACTION]: {
        type: EntryType.ACTION,
        label: 'Action',
        pluralLabel: 'Actions',
        icon: 'square-check',
        showInVault: true,
        showInMomentum: true,
        color: '#10B981' // Vibrant Emerald - action-oriented, growth-focused
    },
    [EntryType.PATH]: {
        type: EntryType.PATH,
        label: 'Path',
        pluralLabel: 'Paths',
        icon: 'compass',
        showInVault: true,
        showInMomentum: true,
        color: '#8B5CF6' // Vibrant Purple - journey, direction, planning
    },
    [EntryType.LOOP]: {
        type: EntryType.LOOP,
        label: 'Loop',
        pluralLabel: 'Loops',
        icon: 'infinity',
        showInVault: true,
        showInMomentum: true,
        color: '#06B6D4' // Vibrant Cyan - cycles, recurring processes
    }
};

// Helper function to get entries that should appear in the Vault
export const getVaultEntryTypes = (): EntryTypeConfig[] => {
    return Object.values(ENTRY_TYPES).filter(entry => entry.showInVault);
};

// Helper function to get entries that should appear in Momentum
export const getMomentumEntryTypes = (): EntryTypeConfig[] => {
    return Object.values(ENTRY_TYPES).filter(entry => entry.showInMomentum);
};