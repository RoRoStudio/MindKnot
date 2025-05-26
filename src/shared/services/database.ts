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
 * Apply database migrations to add missing columns to existing tables
 */
async function applyDatabaseMigrations(): Promise<void> {
    if (!db) return;

    try {
        console.log('Applying database migrations...');

        // Add missing columns to actions table
        try {
            await db.execAsync('ALTER TABLE actions ADD COLUMN subTasks TEXT');
            console.log('Added subTasks column to actions table');
        } catch (error) {
            // Column might already exist, ignore error
            console.log('subTasks column already exists or error adding it:', error);
        }

        try {
            await db.execAsync('ALTER TABLE actions ADD COLUMN actionOrder INTEGER');
            console.log('Added actionOrder column to actions table');
        } catch (error) {
            // Column might already exist, ignore error
            console.log('actionOrder column already exists or error adding it:', error);
        }

        // Add starred and hidden columns to all entry tables
        const entryTables = ['notes', 'sparks', 'actions', 'paths', 'loops'];

        for (const table of entryTables) {
            try {
                await db.execAsync(`ALTER TABLE ${table} ADD COLUMN starred INTEGER DEFAULT 0`);
                console.log(`Added starred column to ${table} table`);
            } catch (error) {
                console.log(`starred column already exists in ${table} or error adding it:`, error);
            }

            try {
                await db.execAsync(`ALTER TABLE ${table} ADD COLUMN hidden INTEGER DEFAULT 0`);
                console.log(`Added hidden column to ${table} table`);
            } catch (error) {
                console.log(`hidden column already exists in ${table} or error adding it:`, error);
            }
        }

        // Add missing columns to milestones table
        try {
            await db.execAsync('ALTER TABLE milestones ADD COLUMN `order` INTEGER DEFAULT 0');
            console.log('Added order column to milestones table');
        } catch (error) {
            // Column might already exist, ignore error
            console.log('order column already exists or error adding it:', error);
        }

        try {
            await db.execAsync('ALTER TABLE milestones ADD COLUMN collapsed INTEGER DEFAULT 0');
            console.log('Added collapsed column to milestones table');
        } catch (error) {
            // Column might already exist, ignore error
            console.log('collapsed column already exists or error adding it:', error);
        }

        console.log('Database migrations completed');
    } catch (error) {
        console.error('Error applying database migrations:', error);
        // Don't throw error to prevent app from crashing on migration failures
    }
}

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
                starred INTEGER DEFAULT 0,
                hidden INTEGER DEFAULT 0,
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
                starred INTEGER DEFAULT 0,
                hidden INTEGER DEFAULT 0,
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
                subTasks TEXT,
                parentId TEXT,
                parentType TEXT,
                actionOrder INTEGER,
                categoryId TEXT,
                starred INTEGER DEFAULT 0,
                hidden INTEGER DEFAULT 0,
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
                starred INTEGER DEFAULT 0,
                hidden INTEGER DEFAULT 0,
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

        // Activity templates table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS activity_templates (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                icon TEXT NOT NULL,
                description TEXT,
                type TEXT,
                navigateTarget TEXT,
                isPredefined INTEGER DEFAULT 0,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            );
        `);

        // Loop activities table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS loop_activities (
                id TEXT PRIMARY KEY,
                loopId TEXT NOT NULL,
                baseActivityId TEXT NOT NULL,
                durationSeconds INTEGER,
                subActions TEXT,
                navigateTarget TEXT,
                \`order\` INTEGER DEFAULT 0,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (loopId) REFERENCES loops(id),
                FOREIGN KEY (baseActivityId) REFERENCES activity_templates(id)
            );
        `);

        // Loop activity instances table (new structure)
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS loop_activity_instances (
                id TEXT PRIMARY KEY,
                loopId TEXT NOT NULL,
                templateId TEXT NOT NULL,
                overriddenTitle TEXT,
                quantityValue INTEGER,
                quantityUnit TEXT,
                durationMinutes INTEGER,
                subActions TEXT,
                navigateTarget TEXT,
                autoCompleteOnTimerEnd INTEGER DEFAULT 1,
                \`order\` INTEGER DEFAULT 0,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (loopId) REFERENCES loops(id),
                FOREIGN KEY (templateId) REFERENCES activity_templates(id)
            );
        `);

        // Loop execution state table
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS loop_execution_state (
                id TEXT PRIMARY KEY,
                loopId TEXT NOT NULL,
                currentActivityIndex INTEGER DEFAULT 0,
                startedAt TEXT NOT NULL,
                completedActivities TEXT,
                completedSubActions TEXT,
                isPaused INTEGER DEFAULT 0,
                pausedAt TEXT,
                timeSpentSeconds INTEGER DEFAULT 0,
                activityTimeTracking TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (loopId) REFERENCES loops(id)
            );
        `);

        // Update loops table to include new fields (with error handling)
        try {
            await db.execAsync(`
                ALTER TABLE loops ADD COLUMN currentActivityIndex INTEGER DEFAULT 0;
            `);
            console.log('Added currentActivityIndex column to loops table');
        } catch (error) {
            // Column might already exist, ignore error
            console.log('currentActivityIndex column already exists or error adding it:', error);
        }

        try {
            await db.execAsync(`
                ALTER TABLE loops ADD COLUMN isExecuting INTEGER DEFAULT 0;
            `);
            console.log('Added isExecuting column to loops table');
        } catch (error) {
            // Column might already exist, ignore error
            console.log('isExecuting column already exists or error adding it:', error);
        }

        try {
            await db.execAsync(`
                ALTER TABLE loops ADD COLUMN lastExecutionDate TEXT;
            `);
            console.log('Added lastExecutionDate column to loops table');
        } catch (error) {
            // Column might already exist, ignore error
            console.log('lastExecutionDate column already exists or error adding it:', error);
        }

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
                starred INTEGER DEFAULT 0,
                hidden INTEGER DEFAULT 0,
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
                \`order\` INTEGER DEFAULT 0,
                collapsed INTEGER DEFAULT 0,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL,
                FOREIGN KEY (pathId) REFERENCES paths(id)
            );
        `);

        // Apply migration for existing tables
        await applyDatabaseMigrations();

        // Add missing columns to activity_templates table if they don't exist
        try {
            await db.execAsync('ALTER TABLE activity_templates ADD COLUMN description TEXT');
            console.log('Added description column to activity_templates table');
        } catch (error) {
            console.log('description column already exists in activity_templates or error adding it:', error);
        }

        try {
            await db.execAsync('ALTER TABLE activity_templates ADD COLUMN navigateTarget TEXT');
            console.log('Added navigateTarget column to activity_templates table');
        } catch (error) {
            console.log('navigateTarget column already exists in activity_templates or error adding it:', error);
        }

        // Add missing columns to loop_execution_state table if they don't exist
        try {
            await db.execAsync('ALTER TABLE loop_execution_state ADD COLUMN completedSubActions TEXT');
            console.log('Added completedSubActions column to loop_execution_state table');
        } catch (error) {
            console.log('completedSubActions column already exists in loop_execution_state or error adding it:', error);
        }

        try {
            await db.execAsync('ALTER TABLE loop_execution_state ADD COLUMN timeSpentSeconds INTEGER DEFAULT 0');
            console.log('Added timeSpentSeconds column to loop_execution_state table');
        } catch (error) {
            console.log('timeSpentSeconds column already exists in loop_execution_state or error adding it:', error);
        }

        try {
            await db.execAsync('ALTER TABLE loop_execution_state ADD COLUMN activityTimeTracking TEXT');
            console.log('Added activityTimeTracking column to loop_execution_state table');
        } catch (error) {
            console.log('activityTimeTracking column already exists in loop_execution_state or error adding it:', error);
        }

        // Add enhanced time tracking columns
        try {
            await db.execAsync('ALTER TABLE loop_execution_state ADD COLUMN activityStartTimes TEXT');
            console.log('Added activityStartTimes column to loop_execution_state table');
        } catch (error) {
            console.log('activityStartTimes column already exists in loop_execution_state or error adding it:', error);
        }

        try {
            await db.execAsync('ALTER TABLE loop_execution_state ADD COLUMN activityEndTimes TEXT');
            console.log('Added activityEndTimes column to loop_execution_state table');
        } catch (error) {
            console.log('activityEndTimes column already exists in loop_execution_state or error adding it:', error);
        }

        try {
            await db.execAsync('ALTER TABLE loop_execution_state ADD COLUMN activityElapsedSeconds TEXT');
            console.log('Added activityElapsedSeconds column to loop_execution_state table');
        } catch (error) {
            console.log('activityElapsedSeconds column already exists in loop_execution_state or error adding it:', error);
        }

        try {
            await db.execAsync('ALTER TABLE loop_execution_state ADD COLUMN lastActiveTimestamp TEXT');
            console.log('Added lastActiveTimestamp column to loop_execution_state table');
        } catch (error) {
            console.log('lastActiveTimestamp column already exists in loop_execution_state or error adding it:', error);
        }

        try {
            await db.execAsync('ALTER TABLE loop_execution_state ADD COLUMN backgroundStartTime TEXT');
            console.log('Added backgroundStartTime column to loop_execution_state table');
        } catch (error) {
            console.log('backgroundStartTime column already exists in loop_execution_state or error adding it:', error);
        }

        try {
            await db.execAsync('ALTER TABLE loop_activity_instances ADD COLUMN autoCompleteOnTimerEnd INTEGER DEFAULT 1');
            console.log('Added autoCompleteOnTimerEnd column to loop_activity_instances table');
        } catch (error) {
            console.log('autoCompleteOnTimerEnd column already exists in loop_activity_instances or error adding it:', error);
        }

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