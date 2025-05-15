// src/utils/databaseReset.ts
import * as SQLite from 'expo-sqlite';
import { createSchemaSQL } from '../database/schema';
import { Alert } from 'react-native';

interface TableRow {
    name: string;
}

export const resetDatabase = async (): Promise<boolean> => {
    try {
        // Method 1: Drop all tables and recreate them
        const db = await SQLite.openDatabaseAsync('mindknot.db');

        // Get all table names
        const tablesResult = await db.getAllAsync<TableRow>(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'android_%'
        `);

        // Drop each table
        for (const tableRow of tablesResult) {
            const tableName = tableRow.name;
            await db.execAsync(`DROP TABLE IF EXISTS ${tableName}`);
            console.log(`Dropped table: ${tableName}`);
        }

        // Recreate schema
        await db.execAsync(createSchemaSQL);
        console.log('Database schema recreated');

        Alert.alert(
            "Database Reset",
            "The database has been reset successfully. Please restart the app.",
            [{ text: "OK" }]
        );

        return true;
    } catch (error) {
        console.error('Failed to reset database:', error);

        Alert.alert(
            "Database Reset Failed",
            "There was an error resetting the database: " + String(error),
            [{ text: "OK" }]
        );

        return false;
    }
};