// src/utils/uuidUtil.ts
import * as Crypto from 'expo-crypto';

// Async UUID generation using Expo's Crypto module
export const generateUUID = async (): Promise<string> => {
    return await Crypto.randomUUID();
};

// Simple synchronous fallback for when we can't use async
// This is less secure but suitable for UI elements like temporary form IDs
export const generateSimpleId = (): string => {
    return 'temp_' + Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};