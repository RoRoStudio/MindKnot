import { Platform } from 'react-native';
import { ThemeType } from './themeTypes';
import tokens from './tokens';

/**
 * Generate a shadow style based on elevation level
 * @param elevation Elevation level (1-5)
 * @param shadowColor Optional custom shadow color
 * @returns Shadow style object
 */
export const getShadow = (
    elevation: 1 | 2 | 3 | 4 | 5,
    shadowColor?: string
) => {
    const shadowMap = {
        1: tokens.shadow.xs,
        2: tokens.shadow.s,
        3: tokens.shadow.m,
        4: tokens.shadow.l,
        5: tokens.shadow.xl,
    };

    const shadow = shadowMap[elevation];

    if (shadowColor) {
        return {
            ...shadow,
            shadowColor,
        };
    }

    return shadow;
};

/**
 * Creates a color with opacity
 * @param hexColor Hex color string
 * @param opacity Opacity value (0-1)
 * @returns RGBA color string
 */
export const getColorWithOpacity = (hexColor: string, opacity: number): string => {
    // Check if it's a valid hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(hexColor)) {
        // Return with default opacity if not a valid hex
        return hexColor;
    }

    // Convert hex to rgb
    let r, g, b;

    // 3 digits
    if (hexColor.length === 4) {
        r = parseInt(hexColor[1] + hexColor[1], 16);
        g = parseInt(hexColor[2] + hexColor[2], 16);
        b = parseInt(hexColor[3] + hexColor[3], 16);
    }
    // 6 digits
    else {
        r = parseInt(hexColor.slice(1, 3), 16);
        g = parseInt(hexColor.slice(3, 5), 16);
        b = parseInt(hexColor.slice(5, 7), 16);
    }

    // Ensure opacity is within valid range
    const validOpacity = Math.max(0, Math.min(1, opacity));

    // Return rgba string
    return `rgba(${r}, ${g}, ${b}, ${validOpacity})`;
};

/**
 * Lightens or darkens a color by a percentage
 * @param hexColor Hex color string
 * @param percent Positive to lighten, negative to darken
 * @returns Modified hex color
 */
export const adjustColor = (hexColor: string, percent: number): string => {
    // Check if it's a valid hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(hexColor)) {
        return hexColor;
    }

    let hex = hexColor;

    // Convert 3 digit hex to 6 digits
    if (hex.length === 4) {
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }

    // Convert to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Adjust each color component
    const adjustComponent = (c: number) => {
        const adjustment = Math.floor(c * (percent / 100));
        return Math.max(0, Math.min(255, c + adjustment));
    };

    // Convert back to hex
    const toHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
    };

    const adjustedR = adjustComponent(r);
    const adjustedG = adjustComponent(g);
    const adjustedB = adjustComponent(b);

    return `#${toHex(adjustedR)}${toHex(adjustedG)}${toHex(adjustedB)}`;
};

/**
 * Get platform-specific value
 * @param iosValue Value for iOS
 * @param androidValue Value for Android
 * @returns Platform-specific value
 */
export const getPlatformValue = <T>(iosValue: T, androidValue: T): T => {
    return Platform.OS === 'ios' ? iosValue : androidValue;
};

/**
 * Get luminance of a color (used for contrast checking)
 * @param hexColor Hex color string
 * @returns Luminance value (0-1)
 */
export const getLuminance = (hexColor: string): number => {
    // Check if it's a valid hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(hexColor)) {
        return 0.5; // Default
    }

    let hex = hexColor;

    // Convert 3 digit hex to 6 digits
    if (hex.length === 4) {
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }

    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // Calculate luminance using WCAG formula
    const calcChannel = (c: number) => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * calcChannel(r) + 0.7152 * calcChannel(g) + 0.0722 * calcChannel(b);
};

/**
 * Check if text color should be light or dark based on background
 * @param backgroundColor Background color in hex
 * @returns Recommended text color for contrast (light or dark)
 */
export const getContrastColor = (backgroundColor: string): string => {
    const luminance = getLuminance(backgroundColor);
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Calculate contrast ratio between two colors
 * @param color1 First color in hex
 * @param color2 Second color in hex
 * @returns Contrast ratio (1-21)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
    const luminance1 = getLuminance(color1);
    const luminance2 = getLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast ratio meets WCAG standards
 * @param backgroundColor Background color
 * @param textColor Text color
 * @param level 'AA' or 'AAA'
 * @param type 'normal' (4.5:1 for AA, 7:1 for AAA) or 'large' (3:1 for AA, 4.5:1 for AAA)
 * @returns Boolean indicating if contrast is sufficient
 */
export const hasAccessibleContrast = (
    backgroundColor: string,
    textColor: string,
    level: 'AA' | 'AAA' = 'AA',
    type: 'normal' | 'large' = 'normal'
): boolean => {
    const ratio = getContrastRatio(backgroundColor, textColor);

    if (level === 'AA') {
        return type === 'normal' ? ratio >= 4.5 : ratio >= 3;
    } else {
        return type === 'normal' ? ratio >= 7 : ratio >= 4.5;
    }
};

/**
 * Returns responsively sized spacing based on screen size
 * Useful for adapting layouts to different screen sizes
 */
export const getResponsiveSpacing = (
    baseSpacing: keyof typeof tokens.spacing,
    scaleFactor = 1
) => {
    const baseValue = tokens.spacing[baseSpacing];
    return baseValue * scaleFactor;
};

/**
 * Create theme-aware style object
 * @param theme Current theme object
 * @param createStyles Function that uses theme to create styles
 * @returns Style object
 */
export function createThemedStyles<T>(
    theme: ThemeType,
    createStyles: (theme: ThemeType) => T
): T {
    return createStyles(theme);
}

export default {
    getShadow,
    getColorWithOpacity,
    adjustColor,
    getPlatformValue,
    getLuminance,
    getContrastColor,
    getContrastRatio,
    hasAccessibleContrast,
    getResponsiveSpacing,
    createThemedStyles,
}; 