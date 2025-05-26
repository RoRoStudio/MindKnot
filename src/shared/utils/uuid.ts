import * as Crypto from 'expo-crypto';

/**
 * Generate a UUID for use as a primary key in the database
 * Using a synchronous implementation to make database operations simpler
 */
export const generateUUID = (): string => {
    try {
        // Use the Crypto.randomUUID method
        return Crypto.randomUUID();
    } catch (error) {
        console.warn('Error generating UUID with Crypto, using fallback method', error);
        return generateRFC4122UUID();
    }
};

/**
 * Generate a simple UUID v4 (random) following RFC4122
 * This is a simplified version that's good enough for our purposes
 * In a production app, consider using a more robust library like 'uuid'
 */
const generateRFC4122UUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}; 