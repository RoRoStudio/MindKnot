/**
 * Design tokens are the visual design atoms of the design system.
 * This file defines all the base tokens that are used to create the theme.
 */

// NEUTRAL COLOR PALETTE
// A comprehensive neutral system avoiding pure white/black while maintaining WCAG compliance
export const colorTokens = {
    // Primary neutral scale - Cool-toned grays for main UI elements, text, and surfaces
    neutral: {
        // Light neutrals - for backgrounds and surfaces
        25: '#FDFDFD',   // Near-white background - primary light surface
        50: '#F8F9FA',   // Very light gray - subtle background variation
        75: '#F1F3F4',   // Light gray - card backgrounds and dividers
        100: '#E8EAED',  // Light gray - borders and inactive elements

        // Mid-light neutrals - for secondary content and subtle UI elements  
        200: '#D3D6DB',  // Medium-light gray - secondary borders
        250: '#C1C7CE',  // Medium-light gray - inactive text backgrounds
        300: '#9AA0A6',  // Medium gray - placeholder text and secondary icons

        // Mid neutrals - for body text and active UI elements
        400: '#80868B',  // Medium-dark gray - secondary text
        500: '#5F6368',  // Balanced gray - primary body text
        600: '#4D5156',  // Dark gray - headings and emphasis

        // Dark neutrals - for high contrast elements
        700: '#3C4043',  // Dark gray - navigation and strong emphasis
        800: '#2D3135',  // Very dark gray - primary headings
        900: '#1F2124',  // Near-black - maximum contrast text
        950: '#16191C',  // Deepest neutral - dark mode backgrounds
    },

    // MINDKNOT BRAND COLORS
    // Sophisticated and elegant brand identity - deep navy + true gold
    brand: {
        // Primary Brand - Sophisticated Deep Navy (trust, intelligence, premium)
        primary: {
            50: '#F8FAFC',   // Very light navy tint
            100: '#F1F5F9',  // Light navy tint  
            200: '#E2E8F0',  // Medium-light navy
            300: '#CBD5E1',  // Medium navy
            400: '#94A3B8',  // Medium-dark navy
            500: '#64748B',  // Base navy
            600: '#475569',  // Brand primary navy
            700: '#334155',  // Deep brand navy
            800: '#1E293B',  // Very deep navy
            900: '#0F172A',  // Deepest brand navy - sophisticated and elegant
            950: '#020617',  // Ultra deep navy
        },

        // Secondary Brand - True Elegant Gold (luxury, warmth, sophistication)
        secondary: {
            50: '#FEFCE8',   // Very light gold tint
            100: '#FEF9C3',  // Light gold tint
            200: '#FEF08A',  // Medium-light gold
            300: '#FDE047',  // Medium gold
            400: '#FACC15',  // Medium-dark gold
            500: '#EAB308',  // Base gold - true elegant gold
            600: '#CA8A04',  // Brand secondary gold - sophisticated
            700: '#A16207',  // Deep brand gold
            800: '#854D0E',  // Very deep gold
            900: '#713F12',  // Deepest brand gold
            950: '#422006',  // Ultra deep gold
        },
    },

    // VIBRANT FUNCTIONAL COLORS
    // High-contrast, accessible functional colors for feedback and status
    functional: {
        // Success - Vibrant green for positive feedback
        success: {
            light: '#D1FAE5',    // Very light green background - WCAG compliant
            main: '#10B981',     // Vibrant emerald green - excellent contrast
            dark: '#047857',     // Deep green - maximum contrast
        },

        // Warning - Vibrant amber for warnings and alerts
        warning: {
            light: '#FEF3C7',    // Very light amber background - WCAG compliant
            main: '#F59E0B',     // Vibrant amber - excellent visibility
            dark: '#D97706',     // Deep amber - high contrast
        },

        // Error - Vibrant red for errors and dangerous actions
        error: {
            light: '#FEE2E2',    // Very light red background - WCAG compliant
            main: '#EF4444',     // Vibrant red - strong error indication
            dark: '#DC2626',     // Deep red - maximum contrast
        },

        // Info - Vibrant blue for information and guidance
        info: {
            light: '#DBEAFE',    // Very light blue background - WCAG compliant  
            main: '#3B82F6',     // Vibrant blue - clear information color
            dark: '#1D4ED8',     // Deep blue - high contrast
        },
    },

    // Special purpose neutrals
    special: {
        overlay: 'rgba(31, 33, 36, 0.5)',      // Semi-transparent dark overlay
        scrim: 'rgba(31, 33, 36, 0.25)',       // Light semi-transparent overlay
        backdrop: 'rgba(95, 99, 104, 0.2)',    // Subtle backdrop for modals
        focus: 'rgba(59, 130, 246, 0.3)',      // Brand blue focus indicator
        shadow: 'rgba(31, 33, 36, 0.15)',      // Subtle shadow color
    }
};

// SPACING SCALE
// Consistent spacing is crucial for visual rhythm
export const spacingTokens = {
    none: 0,
    xxs: 2,
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,

    // Named functional spacing
    screenPadding: 16,
    contentGutter: 8,
    cardPadding: 16,
    sectionSpacing: 24,
};

// TYPOGRAPHY SCALE
// Define the type scale and characteristics
export const typographyTokens = {
    // Font families
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },

    // Font sizes (in pixels)
    fontSize: {
        xxs: 8,
        xs: 10,
        s: 12,
        m: 14,
        l: 18,
        xl: 24,
        xxl: 32,
        xxxl: 40,
    },

    // Font weights
    fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },

    // Line height scale
    lineHeight: {
        tight: 1.15, // For headings
        normal: 1.4,  // For body text
        relaxed: 1.6, // For readable text blocks
    },

    // Letter spacing
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
    },
};

// BORDER RADIUS SCALE
// Defining radius tokens for consistent corner roundness
export const radiusTokens = {
    none: 0,
    xs: 2,
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
    xxl: 20,
    pill: 999, // For pill-shaped elements
    circle: '50%',
};

// Z-INDEX SCALE
// Controlling layering of elements
export const zIndexTokens = {
    base: 0,
    raised: 1,
    dropdown: 10,
    sticky: 100,
    overlay: 200,
    modal: 300,
    toast: 400,
    tooltip: 500,
};

// OPACITY SCALE
export const opacityTokens = {
    none: 0,
    low: 0.2,
    medium: 0.5,
    high: 0.8,
    full: 1,
};

// SHADOW TOKENS
export const shadowTokens = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    xs: {
        shadowColor: '#1F2124',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    s: {
        shadowColor: '#1F2124',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    m: {
        shadowColor: '#1F2124',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    l: {
        shadowColor: '#1F2124',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    xl: {
        shadowColor: '#1F2124',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 9,
    },
};

// ANIMATION TOKENS
export const animationTokens = {
    duration: {
        instant: 50,
        fast: 150,
        normal: 250,
        slow: 350,
        deliberate: 500,
    },
    easing: {
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
    },
};

// Grid system tokens
export const gridTokens = {
    columns: 12,
    gutter: spacingTokens.m,
    margin: spacingTokens.m,
};

// Export all tokens in one object
export const tokens = {
    color: colorTokens,
    spacing: spacingTokens,
    typography: typographyTokens,
    radius: radiusTokens,
    zIndex: zIndexTokens,
    opacity: opacityTokens,
    shadow: shadowTokens,
    animation: animationTokens,
    grid: gridTokens,
};

export default tokens; 