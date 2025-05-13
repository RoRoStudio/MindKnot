// src/database/database.ts
import * as SQLite from 'expo-sqlite';
import { createSchemaSQL } from './schema';

// Correct workaround for TS type gap in expo-sqlite
const db = (SQLite as any).openDatabase('mindknot.db');

export const initDatabase = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.transaction(
            (tx: any) => {
                tx.executeSql(
                    createSchemaSQL,
                    [],
                    (_: any, __: any) => resolve(),
                    (_: any, error: any) => {
                        console.error('Schema creation failed:', error);
                        reject(error);
                        return false;
                    }
                );
            },
            (err: any) => {
                console.error('Transaction error:', err);
                reject(err);
            }
        );
    });
};

export default db;
