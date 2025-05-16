/**
 * Design tokens are the visual design atoms of the design system.
 * This file defines all the base tokens that are used to create the theme.
 */

// BASE COLOR PALETTE
// These are the raw color values used across the application
export const colorTokens = {
    // Brand colors
    brand: {
        blue: {
            50: '#E6EBF0',
            100: '#C1CDD9',
            200: '#98ACBF',
            300: '#6F8BA5',
            400: '#547792', // primaryLight
            500: '#213448', // primary
            600: '#1A2A3A',
            700: '#0E1924', // primaryDark
            800: '#07121B',
            900: '#03080D',
        },
        green: {
            50: '#F8FAE6',
            100: '#F0F2D6', // secondaryContainer
            200: '#ECEFCA', // secondary
            300: '#DFE4AF',
            400: '#C8CCA6', // secondaryDark
            500: '#B2B68E',
            600: '#999C74',
            700: '#7F825A',
            800: '#5C5E40',
            900: '#393A27',
        },
        orange: {
            50: '#FCF1EB',
            100: '#F7DCCF',
            200: '#E99470', // tertiaryLight
            300: '#D47F57',
            400: '#C06B3E', // tertiary
            500: '#984B24', // tertiaryDark
            600: '#7A3D1D',
            700: '#5C2E16',
            800: '#3E1F0E',
            900: '#1F0F07',
        },
        teal: {
            50: '#EBF5F8',
            100: '#D5E9EF',
            200: '#B5CEDA', // accentLight
            300: '#94B4C1', // accent
            400: '#6E8C99', // accentDark
            500: '#566D78',
            600: '#425158',
            700: '#2D3639',
            800: '#1A1F21',
            900: '#0D0F10',
        },
    },

    // Neutral colors (grayscale)
    neutral: {
        white: '#FFFFFF',
        gray: {
            50: '#F9F9F9',
            100: '#F2F2F2', // surface in light mode
            200: '#E6E6E6',
            300: '#D6D6D6',
            400: '#BDBDBD', // textDisabled
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
            950: '#121212', // background in dark mode
        },
        black: '#000000',
    },

    // Functional colors for feedback
    functional: {
        error: {
            light: '#FDEBEB',
            main: '#EB5757', // urgentRed
            dark: '#C62828',
        },
        warning: {
            light: '#FFF3E0',
            main: '#F2994A',
            dark: '#E65100',
        },
        success: {
            light: '#E6F5EB',
            main: '#27AE60',
            dark: '#1B5E20',
        },
        info: {
            light: '#E8F4FD',
            main: '#56CCF2',
            dark: '#0277BD',
        },
    },

    // Special purpose
    special: {
        overlay: 'rgba(0, 0, 0, 0.5)',
        scrim: 'rgba(0, 0, 0, 0.25)',
        backdrop: 'rgba(33, 52, 72, 0.2)', // primary color with opacity
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
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    s: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    m: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    l: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000000',
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