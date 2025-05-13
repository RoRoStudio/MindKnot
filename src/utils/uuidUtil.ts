// src/utils/uuidUtil.ts
import * as Crypto from 'expo-crypto';

export const generateUUID = async (): Promise<string> => {
    return await Crypto.randomUUID();
};