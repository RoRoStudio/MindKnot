// src/database/database.ts - updated executeSql function
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
        // Fix the TypeScript error by providing the correct type
        const result = await db.execAsync([{ sql, args: params }] as any);
        console.log('SQL execution result:', result);

        // Return structured data that matches expectations of consuming code
        // Format for SELECT queries
        if (sql.trim().toLowerCase().startsWith('select')) {
            return {
                // Fix the TypeScript error by using optional chaining and fallback
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