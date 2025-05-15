// src/database/database.ts
import * as SQLite from 'expo-sqlite';
import { createSchemaSQL } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<void> => {
    try {
        db = await SQLite.openDatabaseAsync('mindknot.db');
        console.log('✅ SQLite is available and the database has been opened.');

        // For multi-statement schema: manually substitute parameters
        await db.execAsync(buildSqlWithParams(createSchemaSQL, []));
        console.log('✅ Database schema created successfully.');

        // Handle migration by checking if necessary tables exist
        await migrateDataIfNeeded();
    } catch (error) {
        console.error('❌ Failed to initialize the database:', error);
        throw error;
    }
};

// Migration helper to check if we need to migrate from captures table
async function migrateDataIfNeeded() {
    try {
        // Check if the old captures table exists and has data we need to migrate
        const result = await executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='captures'",
            []
        );

        // If old captures table exists, perform migration
        if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
            console.log('⚠️ Old captures table found. Migration needed.');

            // You would implement your migration logic here
            // For this fix, we're going with a fresh start instead of migration
        }
    } catch (error) {
        console.log('No migration needed or migration failed:', error);
    }
}

export const executeSql = async (
    sql: string,
    params: any[] = []
): Promise<{
    rows: { _array: any[]; length: number; item: (i: number) => any };
    rowsAffected: number;
}> => {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }

    try {
        const preparedSql = buildSqlWithParams(sql, params);
        console.log('🟡 Executing SQL:\n', sql);
        console.log('🟡 With params:', params);
        console.log('🟡 Prepared SQL:\n', preparedSql);

        const result = await db.execAsync(preparedSql);

        // Wrap result in rows-like structure for SELECTs
        return {
            rows: {
                _array: Array.isArray(result) ? result : [],
                length: Array.isArray(result) ? result.length : 0,
                item: (index: number) =>
                    Array.isArray(result) && index < result.length ? result[index] : null,
            },
            rowsAffected: 0, // You can extend this if needed for non-SELECTs
        };
    } catch (error) {
        console.error('❌ SQL execution failed:', error);
        console.error('🔴 SQL:', sql);
        console.error('🔴 Params:', params);
        throw error;
    }
};

function buildSqlWithParams(sql: string, params: any[]): string {
    let index = 0;
    return sql.replace(/\?/g, () => {
        const param = params[index++];
        if (param === null || param === undefined) {
            return 'NULL';
        } else if (typeof param === 'string') {
            return `'${param.replace(/'/g, "''")}'`; // escape single quotes
        } else if (typeof param === 'number' || typeof param === 'boolean') {
            return param.toString();
        } else {
            return `'${JSON.stringify(param).replace(/'/g, "''")}'`;
        }
    });
}