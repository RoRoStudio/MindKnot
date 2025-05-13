import * as SQLite from 'expo-sqlite';
import { createSchemaSQL } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<void> => {
    try {
        // Open or create the database
        db = await SQLite.openDatabaseAsync('mindknot.db');
        console.log('✅ SQLite is available and the database has been opened.');

        // Execute schema creation
        await db.execAsync(createSchemaSQL);
        console.log('✅ Database schema created successfully.');
    } catch (error) {
        console.error('❌ Failed to initialize the database:', error);
        throw error;
    }
};

export default db;
