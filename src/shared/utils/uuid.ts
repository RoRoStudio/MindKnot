/**
 * UUID Generation Utility
 * Simple UUID v4 generation for creating unique identifiers
 */

/**
 * Generate a UUID v4 string
 * Simple implementation for React Native compatibility
 */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Generate a short ID (8 characters)
 * Useful for shorter identifiers
 */
export const generateShortId = (): string => {
    return Math.random().toString(36).substring(2, 10);
};

/**
 * Generate a timestamp-based ID
 * Useful for ordered identifiers
 */
export const generateTimestampId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}; 