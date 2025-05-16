// src/database/database.ts
import * as SQLite from 'expo-sqlite';
import { createSchemaSQL } from './schema';

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

        if (!(await tableExists('loops'))) {
            console.log('Table loops does not exist yet, skipping column updates');
            return;
        }

        // Instead of trying to add columns that might exist, 
        // we'll use a try-catch but with a query that first checks if the column exists

        console.log('Checking for missing columns in actions table...');

        // Use a safer approach with a single SQL statement that checks before adding
        const addColumnIfNotExists = async (
            tableName: string,
            columnName: string,
            columnDef: string
        ) => {
            try {
                // This query first checks if the column exists, and only adds it if it doesn't
                // The SQL below is SQLite specific and safe for concurrent execution
                await executeSql(`
                    BEGIN TRANSACTION;
                    -- Create a temporary table to test if we can select the column
                    SELECT CASE 
                        WHEN COUNT(*) = 0 THEN
                            -- Column doesn't exist, so add it
                            ('ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}')
                        ELSE
                            -- Column exists, do nothing
                            ('SELECT 1')
                    END as stmt
                    FROM pragma_table_info('${tableName}') 
                    WHERE name='${columnName}'
                    INTO @sql;
                    
                    -- Execute the generated statement
                    EXECUTE @sql;
                    COMMIT;
                `);
                console.log(`✅ Checked column ${columnName} in ${tableName}`);
            } catch (error) {
                // Only log as error if it's not about column already existing
                if (error instanceof Error && !error.message.includes('duplicate column')) {
                    console.error(`Error handling column ${columnName} in ${tableName}:`, error);
                } else {
                    console.log(`Column ${columnName} already exists in ${tableName}`);
                }
            }
        };

        // We'll simplify our approach since SQLite in Expo has limitations
        // Let's just get all column info first and then only add what's missing

        try {
            const actionsColumns = await executeSql(`PRAGMA table_info(actions)`);
            console.log('Current actions columns:', JSON.stringify(actionsColumns.rows._array));

            // Check which columns exist
            const hasDesc = actionsColumns.rows._array.some(col => col.name === 'description');
            const hasCompleted = actionsColumns.rows._array.some(col => col.name === 'completed');
            const hasPriority = actionsColumns.rows._array.some(col => col.name === 'priority');

            // Only add columns that don't exist
            if (!hasDesc) {
                await executeSql(`ALTER TABLE actions ADD COLUMN description TEXT`);
                console.log('✅ Added description column to actions table');
            } else {
                console.log('✓ Description column already exists in actions table');
            }

            if (!hasCompleted) {
                await executeSql(`ALTER TABLE actions ADD COLUMN completed INTEGER DEFAULT 0`);
                console.log('✅ Added completed column to actions table');
            } else {
                console.log('✓ Completed column already exists in actions table');
            }

            if (!hasPriority) {
                await executeSql(`ALTER TABLE actions ADD COLUMN priority INTEGER DEFAULT 2`);
                console.log('✅ Added priority column to actions table');
            } else {
                console.log('✓ Priority column already exists in actions table');
            }

            // Do the same for loops table
            const loopsColumns = await executeSql(`PRAGMA table_info(loops)`);
            console.log('Current loops columns:', JSON.stringify(loopsColumns.rows._array));

            const hasActive = loopsColumns.rows._array.some(col => col.name === 'active');
            const hasStartDate = loopsColumns.rows._array.some(col => col.name === 'startDate');
            const hasEndDate = loopsColumns.rows._array.some(col => col.name === 'endDate');

            if (!hasActive) {
                await executeSql(`ALTER TABLE loops ADD COLUMN active INTEGER DEFAULT 1`);
                console.log('✅ Added active column to loops table');
            } else {
                console.log('✓ Active column already exists in loops table');
            }

            if (!hasStartDate) {
                await executeSql(`ALTER TABLE loops ADD COLUMN startDate TEXT`);
                console.log('✅ Added startDate column to loops table');
            } else {
                console.log('✓ StartDate column already exists in loops table');
            }

            if (!hasEndDate) {
                await executeSql(`ALTER TABLE loops ADD COLUMN endDate TEXT`);
                console.log('✅ Added endDate column to loops table');
            } else {
                console.log('✓ EndDate column already exists in loops table');
            }

        } catch (error) {
            console.error('Error checking table columns:', error);
        }

    } catch (error) {
        console.error('Error updating schema:', error);
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