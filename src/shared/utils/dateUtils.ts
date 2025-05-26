/**
 * Date utility functions
 */

/**
 * Formats a duration in milliseconds to a human-readable string
 * @param durationMs Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m", "45s", "1m 15s")
 */
export const formatDuration = (durationMs: number): string => {
    if (durationMs < 0) return '0s';

    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }

    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }

    if (minutes > 0) {
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }

    return `${seconds}s`;
};

/**
 * Formats a duration in seconds to a human-readable string
 * @param durationSeconds Duration in seconds
 * @returns Formatted duration string
 */
export const formatDurationFromSeconds = (durationSeconds: number): string => {
    return formatDuration(durationSeconds * 1000);
};

/**
 * Formats a timestamp to a relative time string
 * @param timestamp Timestamp in milliseconds
 * @returns Relative time string (e.g., "2 minutes ago", "1 hour ago")
 */
export const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    }

    if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    if (diff < 86400000) { // Less than 1 day
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    if (diff < 604800000) { // Less than 1 week
        const days = Math.floor(diff / 86400000);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    // More than a week, show actual date
    return new Date(timestamp).toLocaleDateString();
};

/**
 * Formats a date to a short string
 * @param date Date object or timestamp
 * @returns Formatted date string (e.g., "Mar 15", "Dec 3")
 */
export const formatShortDate = (date: Date | number): string => {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Formats a time to a short string
 * @param date Date object or timestamp
 * @returns Formatted time string (e.g., "2:30 PM", "9:15 AM")
 */
export const formatShortTime = (date: Date | number): string => {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};
