// src/api/database.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get the database instance - creates it if it doesn't exist yet
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (!db) {
        try {
            // Open the database
            db = await SQLite.openDatabaseAsync('mindknot.db');

            // Set up the database with WAL mode for better performance
            await db.execAsync(`PRAGMA journal_mode = WAL;`);
            await db.execAsync(`PRAGMA foreign_keys = ON;`);

            // Create tables if they don't exist
            await createTables();

            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Failed to open database:', error);
            throw new Error(`Database initialization error: ${error}`);
        }
    }

    return db;
};

/**
 * Create necessary tables in the database
 */
async function createTables(): Promise<void> {
    if (!db) return;

    try {
        console.log('Starting table creation process');

        // Check what tables already exist
        try {
            const tables = await db.getAllAsync('SELECT name FROM sqlite_master WHERE type="table"');
            console.log('Existing tables:', tables);
        } catch (e) {
            console.error('Failed to check existing tables:', e);
        }

        // Create all tables using the schema
        console.log('Creating all tables...');

        // Sagas table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS sagas (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );
        `);

        // Chapters table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS chapters (
                id TEXT PRIMARY KEY,
                sagaId TEXT NOT NULL,
                title TEXT,
                chapterNumber INTEGER NOT NULL,
                startDate TEXT NOT NULL,
                endDate TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (sagaId) REFERENCES sagas(id)
            );
        `);

        // Categories table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                color TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );
        `);

        // Notes table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT,
                body TEXT,
                tags TEXT,
                categoryId TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (categoryId) REFERENCES categories(id)
            );
        `);

        // Sparks table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS sparks (
                id TEXT PRIMARY KEY,
                title TEXT,
                body TEXT,
                tags TEXT,
                linkedEntryIds TEXT,
                categoryId TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (categoryId) REFERENCES categories(id)
            );
        `);

        // Actions table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS actions (
                id TEXT PRIMARY KEY,
                title TEXT,
                body TEXT,
                description TEXT DEFAULT '',
                tags TEXT,
                done INTEGER DEFAULT 0,
                completed INTEGER DEFAULT 0,
                priority INTEGER DEFAULT 0,
                dueDate TEXT,
                subActions TEXT,
                parentId TEXT,
                parentType TEXT,
                categoryId TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (categoryId) REFERENCES categories(id)
            );
        `);

        // Loops table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS loops (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                frequency TEXT,
                startTimeByDay TEXT,
                active INTEGER DEFAULT 1,
                startDate TEXT,
                endDate TEXT,
                tags TEXT,
                categoryId TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (categoryId) REFERENCES categories(id)
            );
        `);

        // Loop items table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS loop_items (
                id TEXT PRIMARY KEY,
                loopId TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                durationMinutes INTEGER,
                quantity TEXT,
                icon TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (loopId) REFERENCES loops(id)
            );
        `);

        // Paths table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS paths (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                startDate TEXT,
                targetDate TEXT,
                tags TEXT,
                categoryId TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (categoryId) REFERENCES categories(id)
            );
        `);

        // Milestones table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS milestones (
                id TEXT PRIMARY KEY,
                pathId TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (pathId) REFERENCES paths(id)
            );
        `);

        console.log('All tables created successfully');

        // Verify tables were created
        try {
            const finalTables = await db.getAllAsync('SELECT name FROM sqlite_master WHERE type="table"');
            console.log('Final tables:', finalTables);
        } catch (e) {
            console.error('Failed to verify final tables:', e);
        }

        console.log('Table creation process completed');
    } catch (error) {
        console.error('Error creating tables:', error);
        const errorDetails = error instanceof Error ? {
            message: error.message,
            name: error.name,
            stack: error.stack
        } : {
            message: 'Unknown error',
            name: 'UnknownError',
            stack: 'No stack trace available'
        };
        console.error('Error details:', errorDetails);
        throw error;
    }
}

/**
 * Execute a SQL query using the older SQLite API format
 * This is kept for backward compatibility with existing service files
 */
export const executeSql = async (
    sql: string,
    params: any[] = []
): Promise<{ rows: { _array: any[] } }> => {
    try {
        const database = await getDatabase();
        const result = await database.getAllAsync(sql, params);
        return { rows: { _array: result } };
    } catch (error) {
        console.error(`SQL execution failed: ${sql}`, error);
        throw error;
    }
};

/**
 * Execute a SQL query that returns data
 */
export const executeQuery = async <T = any>(
    sql: string,
    params: any[] = []
): Promise<T[]> => {
    try {
        const database = await getDatabase();
        return await database.getAllAsync<T>(sql, params);
    } catch (error) {
        console.error(`Query execution failed: ${sql}`, error);
        throw error;
    }
};

/**
 * Execute a SQL query that modifies data (INSERT, UPDATE, DELETE)
 */
export const executeWrite = async (
    sql: string,
    params: any[] = []
): Promise<{ changes: number, lastInsertRowId?: number }> => {
    try {
        console.log('EXECUTING WRITE OPERATION');
        console.log('SQL:', sql);
        console.log('Params:', JSON.stringify(params));

        const database = await getDatabase();
        console.log('Database connection obtained');

        // Debug database state
        try {
            const tableInfo = await database.getAllAsync('SELECT name FROM sqlite_master WHERE type="table"');
            console.log('Available tables:', tableInfo);
        } catch (e) {
            console.error('Error checking tables:', e);
        }

        console.log('Executing runAsync...');
        const result = await database.runAsync(sql, params);
        console.log('runAsync completed with result:', result);

        return {
            changes: result.changes,
            lastInsertRowId: result.lastInsertRowId
        };
    } catch (error) {
        console.error(`Write operation failed: ${sql}`, error);
        const errorDetails = error instanceof Error ? {
            message: error.message,
            name: error.name,
            stack: error.stack
        } : {
            message: 'Unknown error',
            name: 'UnknownError',
            stack: 'No stack trace available'
        };
        console.error('Error details:', errorDetails);
        throw error;
    }
};

/**
 * Close the database connection
 */
export const closeDatabase = async (): Promise<void> => {
    if (db) {
        await db.closeAsync();
        db = null;
        console.log('Database connection closed');
    }
};

/**
 * Initialize the database
 */
export const initDatabase = async (): Promise<void> => {
    try {
        await getDatabase();
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}; 