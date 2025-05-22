// src/database/database.ts
import * as SQLite from 'expo-sqlite';
import { createSchemaSQL, migrationSQL, addColumnIfNotExists } from './schema';

let db: SQLite.SQLiteDatabase | null = null;
// Debug flag to control SQL logging - set to false to disable excessive logging
const DEBUG_SQL = true;

export const initDatabase = async (): Promise<void> => {
    try {
        db = await SQLite.openDatabaseAsync('mindknot.db');
        console.log('✅ SQLite is available and the database has been opened.');

        // For multi-statement schema: manually substitute parameters
        await db.execAsync(buildSqlWithParams(createSchemaSQL, []));
        console.log('✅ Database schema created successfully.');

        // Handle migration by checking if necessary tables exist
        await migrateDataIfNeeded();

        // Apply schema updates/migrations
        await updateSchema();
    } catch (error) {
        console.error('❌ Failed to initialize the database:', error);
        throw error;
    }
};

// Function to check if table exists
async function tableExists(tableName: string): Promise<boolean> {
    try {
        const result = await executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            [tableName]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error(`Error checking if table ${tableName} exists:`, error);
        return false;
    }
}

// Add columns that might be missing from the schema
async function updateSchema() {
    try {
        // Verify tables exist before trying to modify them
        if (!(await tableExists('actions'))) {
            console.log('Table actions does not exist yet, skipping column updates');
            return;
        }

        // First, check if the actions table exists
        console.log('Checking and updating actions table schema...');
        await checkActionsTable();

    } catch (error) {
        console.error('Error updating schema:', error);
    }
}

// New function to specifically check and update the actions table
async function checkActionsTable() {
    try {
        // Get current columns in the actions table
        const actionsColumns = await executeSql(`PRAGMA table_info(actions)`);
        const columns = actionsColumns.rows._array;
        console.log('Current actions columns:', JSON.stringify(columns));

        // Check which columns we need to add
        const columnMap = new Map();
        columns.forEach(col => {
            columnMap.set(col.name, true);
        });

        // Add required columns if they don't exist
        if (!columnMap.has('description')) {
            await executeSql(`ALTER TABLE actions ADD COLUMN description TEXT DEFAULT ''`);
            console.log('✅ Added description column to actions table');
        }

        if (!columnMap.has('completed')) {
            await executeSql(`ALTER TABLE actions ADD COLUMN completed INTEGER DEFAULT 0`);
            console.log('✅ Added completed column to actions table');
        }

        if (!columnMap.has('priority')) {
            await executeSql(`ALTER TABLE actions ADD COLUMN priority INTEGER DEFAULT 0`);
            console.log('✅ Added priority column to actions table');
        }

        if (!columnMap.has('categoryId')) {
            await executeSql(`ALTER TABLE actions ADD COLUMN categoryId TEXT`);
            console.log('✅ Added categoryId column to actions table');
        }

        console.log('✅ Actions table schema update completed');

    } catch (error) {
        console.error('Error updating actions table schema:', error);
        throw error;
    }
}

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
        // Only log SQL statements when debug flag is enabled
        if (DEBUG_SQL) {
            console.log('🟡 Executing SQL:\n', sql);
            console.log('🟡 With params:', params);

            const preparedSql = buildSqlWithParams(sql, params);
            console.log('🟡 Prepared SQL:\n', preparedSql);
        }

        const preparedSql = buildSqlWithParams(sql, params);

        // For SELECT queries, use the promised-based query method
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            const result = await db.getAllAsync(preparedSql);
            return {
                rows: {
                    _array: result,
                    length: result.length,
                    item: (index: number) => index < result.length ? result[index] : null,
                },
                rowsAffected: 0
            };
        }
        // For PRAGMA queries, also use the query method
        else if (sql.trim().toUpperCase().startsWith('PRAGMA')) {
            const result = await db.getAllAsync(preparedSql);
            return {
                rows: {
                    _array: result,
                    length: result.length,
                    item: (index: number) => index < result.length ? result[index] : null,
                },
                rowsAffected: 0
            };
        }
        // For non-SELECT queries, use the exec method
        else {
            await db.execAsync(preparedSql);
            return {
                rows: { _array: [], length: 0, item: () => null },
                rowsAffected: 1 // Assuming at least one row was affected
            };
        }
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
        } else if (param instanceof Date) {
            // Handle Date objects
            return `'${param.toISOString()}'`;
        } else {
            // For objects, arrays, etc.
            return `'${JSON.stringify(param).replace(/'/g, "''")}'`;
        }
    });
}