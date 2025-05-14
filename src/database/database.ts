// src/database/database.ts
import * as SQLite from 'expo-sqlite';

// Create a database instance
let db: SQLite.SQLiteDatabase | null = null;

// Initialize the database
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

// Import schema
import { createSchemaSQL } from './schema';

// Function to execute SQL with parameters
export const executeSql = async (
    sql: string,
    params: any[] = []
): Promise<any> => {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }

    try {
        console.log(`Executing SQL: ${sql}`);
        console.log('With params:', params);

        // Build SQL with params for logging purpose
        const preparedSql = buildSqlWithParams(sql, params);
        console.log('Prepared SQL:', preparedSql);

        // Execute the SQL with proper params
        const result = await db.execAsync([{ sql, args: params }]);
        console.log('SQL execution result:', result);

        // Return structured data that matches expectations of consuming code
        // Format for SELECT queries
        if (sql.trim().toLowerCase().startsWith('select')) {
            return {
                rows: result?.[0]?.rows || [],
                rowsAffected: 0
            };
        }

        // Format for other queries (INSERT, UPDATE, DELETE)
        return {
            rowsAffected: 1, // Assume 1 row affected if no error
            insertId: null
        };
    } catch (error) {
        console.error('SQL execution error:', error);
        console.error('Failed SQL:', sql);
        console.error('Failed params:', params);
        throw error;
    }
};

// Helper function to build SQL with parameters for logging only
// This is just for debug logs - actual parameters are passed to db.execAsync
function buildSqlWithParams(sql: string, params: any[]): string {
    let index = 0;
    return sql.replace(/\?/g, () => {
        const param = params[index++];
        if (param === null || param === undefined) {
            return 'NULL';
        } else if (typeof param === 'string') {
            return `'${param.replace(/'/g, "''")}'`; // Escape single quotes
        } else if (typeof param === 'number' || typeof param === 'boolean') {
            return param.toString();
        } else {
            return `'${JSON.stringify(param).replace(/'/g, "''")}'`;
        }
    });
}

export default {
    initDatabase,
    executeSql
};