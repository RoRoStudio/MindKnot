/**
 * Debug Logger Utility
 * Provides comprehensive logging for different modules with toggle capability
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogModule = 'LOOP' | 'STORAGE' | 'NAVIGATION' | 'FORMS' | 'GENERAL';

interface LogConfig {
    enabled: boolean;
    modules: Record<LogModule, boolean>;
    level: LogLevel;
}

class DebugLogger {
    private config: LogConfig = {
        enabled: __DEV__, // Only enable in development by default
        modules: {
            LOOP: true,
            STORAGE: true,
            NAVIGATION: true,
            FORMS: true,
            GENERAL: true,
        },
        level: 'debug'
    };

    private logLevels: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    };

    private colors: Record<LogModule, string> = {
        LOOP: '🔄',
        STORAGE: '💾',
        NAVIGATION: '🧭',
        FORMS: '📝',
        GENERAL: '🔧'
    };

    constructor() {
        // Log initialization
        if (this.config.enabled) {
            console.log('🚀 DebugLogger initialized');
        }
    }

    private shouldLog(module: LogModule, level: LogLevel): boolean {
        return (
            this.config.enabled &&
            this.config.modules[module] &&
            this.logLevels[level] >= this.logLevels[this.config.level]
        );
    }

    private formatMessage(module: LogModule, method: string, message: string, data?: any): string {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const emoji = this.colors[module];
        return `${emoji} [${timestamp}] ${module}:${method} - ${message}`;
    }

    debug(module: LogModule, method: string, message: string, data?: any) {
        if (!this.shouldLog(module, 'debug')) return;
        const formatted = this.formatMessage(module, method, message);
        if (data) {
            console.log(formatted, data);
        } else {
            console.log(formatted);
        }
    }

    info(module: LogModule, method: string, message: string, data?: any) {
        if (!this.shouldLog(module, 'info')) return;
        const formatted = this.formatMessage(module, method, message);
        if (data) {
            console.info(formatted, data);
        } else {
            console.info(formatted);
        }
    }

    warn(module: LogModule, method: string, message: string, data?: any) {
        if (!this.shouldLog(module, 'warn')) return;
        const formatted = this.formatMessage(module, method, message);
        if (data) {
            console.warn(formatted, data);
        } else {
            console.warn(formatted);
        }
    }

    error(module: LogModule, method: string, message: string, error?: any) {
        if (!this.shouldLog(module, 'error')) return;
        const formatted = this.formatMessage(module, method, message);
        if (error) {
            console.error(formatted, error);
        } else {
            console.error(formatted);
        }
    }

    // Configuration methods
    toggleModule(module: LogModule, enabled: boolean) {
        this.config.modules[module] = enabled;
        this.info('GENERAL', 'toggleModule', `Module ${module} ${enabled ? 'enabled' : 'disabled'}`);
    }

    setLevel(level: LogLevel) {
        this.config.level = level;
        this.info('GENERAL', 'setLevel', `Log level set to ${level}`);
    }

    enable() {
        this.config.enabled = true;
        console.log('🚀 DebugLogger enabled');
    }

    disable() {
        this.config.enabled = false;
        console.log('🛑 DebugLogger disabled');
    }

    getConfig(): LogConfig {
        return { ...this.config };
    }

    // Convenience methods for specific scenarios
    logStorageOperation(operation: string, key: string, data?: any) {
        this.debug('STORAGE', operation, `Key: ${key}`, data);
    }

    logNavigationEvent(screen: string, params?: any) {
        this.debug('NAVIGATION', 'navigate', `To: ${screen}`, params);
    }

    logLoopOperation(operation: string, loopId?: string, data?: any) {
        this.debug('LOOP', operation, loopId ? `Loop: ${loopId}` : 'General', data);
    }

    logFormEvent(formName: string, event: string, data?: any) {
        this.debug('FORMS', formName, event, data);
    }
}

// Create singleton instance
export const debugLogger = new DebugLogger();

// Export convenience functions
export const logLoop = (operation: string, loopId?: string, data?: any) =>
    debugLogger.logLoopOperation(operation, loopId, data);

export const logStorage = (operation: string, key: string, data?: any) =>
    debugLogger.logStorageOperation(operation, key, data);

export const logNavigation = (screen: string, params?: any) =>
    debugLogger.logNavigationEvent(screen, params);

export const logForm = (formName: string, event: string, data?: any) =>
    debugLogger.logFormEvent(formName, event, data);

// Quick access to logger methods
export const log = {
    debug: (module: LogModule, method: string, message: string, data?: any) =>
        debugLogger.debug(module, method, message, data),
    info: (module: LogModule, method: string, message: string, data?: any) =>
        debugLogger.info(module, method, message, data),
    warn: (module: LogModule, method: string, message: string, data?: any) =>
        debugLogger.warn(module, method, message, data),
    error: (module: LogModule, method: string, message: string, error?: any) =>
        debugLogger.error(module, method, message, error),
};

export default debugLogger; 