// Colors utility for consistent color usage across the app

// Status colors - using the ones from globals.css
export const colors = {
    // Core colors from globals.css
    primary: "var(--primary)",
    secondary: "var(--secondary)",

    // Status colors
    statusCompleted: "var(--status-completed)", // Green for completed (#10b981)
    statusActive: "var(--status-active)",
    statusSkipped: "var(--status-skipped)",
    statusPending: "var(--status-pending)",
};

// Tailwind class utility functions
export const getStatusClasses = (status: "completed" | "skipped" | "partial" | "interrupted" | "active" | "pending") => {
    switch (status) {
        case "completed":
            return {
                bg: "bg-[var(--status-completed)]",
                text: "text-[var(--status-completed)]",
                border: "border-[var(--status-completed)]",
                bgOpacity: "bg-[var(--status-completed)]/20",
                icon: "text-[var(--status-completed)]"
            };
        case "active":
            return {
                bg: "bg-neutral-700",
                text: "text-neutral-700",
                border: "border-neutral-700",
                bgOpacity: "bg-neutral-700/20",
                icon: "text-neutral-700"
            };
        case "partial":
            return {
                bg: "bg-neutral-500",
                text: "text-neutral-700",
                border: "border-neutral-500",
                bgOpacity: "bg-neutral-500/20",
                icon: "text-neutral-500"
            };
        case "skipped":
        case "interrupted":
        case "pending":
        default:
            return {
                bg: "bg-neutral-300",
                text: "text-neutral-500",
                border: "border-neutral-300",
                bgOpacity: "bg-neutral-300/20",
                icon: "text-neutral-500"
            };
    }
};

// Button styles
export const buttonStyles = {
    primary: "bg-neutral-700 text-white hover:bg-neutral-800",
    secondary: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
    green: "bg-[var(--status-completed)] text-white hover:bg-[var(--status-completed)]/90",
    outline: "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
};

// Gradient styles - explicitly defined rather than using variables
export const gradients = {
    primary: "bg-gradient-to-br from-gray-800 via-black to-gray-900", // Deep black gradient
    secondary: "bg-gradient-to-br from-gray-700 to-gray-800", // Secondary black gradient
    neutral: "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200", // Light gray gradient
    destructive: "bg-gradient-to-br from-red-500 to-red-600", // Using system destructive color
    green: "bg-gradient-to-br from-[var(--status-completed)] to-[color:var(--status-completed)]/80" // Green gradient
};