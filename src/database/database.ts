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
    } catch (error) {
        console.error('❌ Failed to initialize the database:', error);
        throw error;
    }
};

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
